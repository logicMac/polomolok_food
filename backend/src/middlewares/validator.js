"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
            return;
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validator.js.map