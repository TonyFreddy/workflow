const Joi = require('joi');

// const workflowSchema = Joi.object({
//     payload: Joi.object({
//         problemDescription: Joi.string()
//             .min(1)
//             .max(500)
//             .required()
//             .messages({
//                 'string.empty': 'Problem description cannot be empty',
//                 'any.required': 'Problem description is required',
//             }),
//         solution: Joi.string()
//             .min(1)
//             .max(500)
//             .required()
//             .messages({
//                 'string.empty': 'Solution cannot be empty',
//                 'any.required': 'Solution is required',
//             })
//         // Retirer appointmentDate
//     }).required(),
//     email: Joi.string()
//         .email()
//         .required()
//         .messages({
//             'string.email': 'Email must be a valid email address',
//             'any.required': 'Email is required',
//         }),
// });

// const validateWorkflow = (data) => {
//     return workflowSchema.validate(data, { abortEarly: false });
// };

module.exports = { validateWorkflow };