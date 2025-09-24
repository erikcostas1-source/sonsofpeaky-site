/**
 * Authentication Middleware - Middleware de Autenticação
 * Gerador de Rolês API
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Main authentication middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('+loginAttempts +lockUntil');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token inválido - usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        error: 'Conta desativada',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        error: 'Senha alterada recentemente. Faça login novamente',
        code: 'PASSWORD_CHANGED'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: 'Conta temporariamente bloqueada',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
      verified: user.verified
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Erro interno de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.active && !user.changedPasswordAfter(decoded.iat)) {
      req.user = {
        userId: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        verified: user.verified
      };
    }

    next();

  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Plan-based authorization middleware
 */
const requirePlan = (...plans) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!plans.includes(req.user.plan)) {
      return res.status(403).json({
        error: 'Plano insuficiente',
        code: 'PLAN_REQUIRED',
        required: plans,
        current: req.user.plan
      });
    }

    next();
  };
};

/**
 * Feature-based authorization middleware
 */
const requireFeature = (feature) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      const user = await User.findById(req.user.userId);
      
      if (!user.hasFeature(feature)) {
        return res.status(403).json({
          error: 'Recurso não disponível no seu plano',
          code: 'FEATURE_NOT_AVAILABLE',
          feature,
          plan: req.user.plan
        });
      }

      next();

    } catch (error) {
      logger.error('Feature check error:', error);
      return res.status(500).json({
        error: 'Erro ao verificar permissões',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Generation limit middleware
 */
const checkGenerationLimit = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação requerida',
      code: 'AUTH_REQUIRED'
    });
  }

  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.canGenerate()) {
      const planLimits = user.planLimits;
      
      return res.status(429).json({
        error: 'Limite de gerações atingido',
        code: 'GENERATION_LIMIT_REACHED',
        limit: planLimits.generations,
        used: user.monthlyGenerationsUsed,
        plan: user.plan,
        resetDate: getNextMonthStart()
      });
    }

    // Attach user object to request for generation counting
    req.userModel = user;
    next();

  } catch (error) {
    logger.error('Generation limit check error:', error);
    return res.status(500).json({
      error: 'Erro ao verificar limite de gerações',
      code: 'LIMIT_CHECK_ERROR'
    });
  }
};

/**
 * Email verification middleware
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação requerida',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.verified) {
    return res.status(403).json({
      error: 'Email não verificado',
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Verifique seu email antes de continuar'
    });
  }

  next();
};

/**
 * Admin-only middleware (combines auth and role check)
 */
const requireAdmin = [authMiddleware, requireRole('admin', 'super_admin')];

/**
 * Super admin-only middleware
 */
const requireSuperAdmin = [authMiddleware, requireRole('super_admin')];

/**
 * Extract JWT token from request
 */
function extractToken(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check x-access-token header
  const xAccessToken = req.headers['x-access-token'];
  if (xAccessToken) {
    return xAccessToken;
  }

  // Check query parameter (not recommended for production)
  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

/**
 * Get next month start date
 */
function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Middleware to log authenticated requests
 */
const logAuthenticatedRequest = (req, res, next) => {
  if (req.user) {
    logger.info(`Authenticated request: ${req.method} ${req.path} - User: ${req.user.email} (${req.user.plan})`);
  }
  next();
};

/**
 * API Key authentication middleware (for external integrations)
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API Key requerida',
        code: 'API_KEY_REQUIRED'
      });
    }

    // Find user by API key (you'll need to add apiKey field to User model)
    const user = await User.findOne({ apiKey: apiKey, active: true });
    
    if (!user) {
      return res.status(401).json({
        error: 'API Key inválida',
        code: 'INVALID_API_KEY'
      });
    }

    // Check if user has API access feature
    if (!user.hasFeature('api_access')) {
      return res.status(403).json({
        error: 'Acesso à API não disponível no seu plano',
        code: 'API_ACCESS_NOT_AVAILABLE'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
      apiAccess: true
    };

    next();

  } catch (error) {
    logger.error('API Key auth error:', error);
    return res.status(500).json({
      error: 'Erro interno de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requirePlan,
  requireFeature,
  checkGenerationLimit,
  requireVerification,
  requireAdmin,
  requireSuperAdmin,
  logAuthenticatedRequest,
  apiKeyAuth
};