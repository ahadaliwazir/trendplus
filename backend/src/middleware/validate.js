const { body, validationResult } = require('express-validator');

// Validation result checker middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validation rules
const signupRules = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
];

const loginRules = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// User drama validation rules
const addDramaRules = [
    body('drama_id')
        .isInt({ min: 1 })
        .withMessage('Valid drama ID is required'),
    body('status')
        .optional()
        .isIn(['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'])
        .withMessage('Invalid status'),
    body('user_rating')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Rating must be between 1 and 10'),
    body('episodes_watched')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Episodes watched must be a positive number')
];

const updateDramaRules = [
    body('status')
        .optional()
        .isIn(['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'])
        .withMessage('Invalid status'),
    body('user_rating')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Rating must be between 1 and 10'),
    body('episodes_watched')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Episodes watched must be a positive number')
];

module.exports = {
    validate,
    signupRules,
    loginRules,
    addDramaRules,
    updateDramaRules
};
