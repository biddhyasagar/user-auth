import * as Yup from 'yup';

export const userValidationSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    permanentAddress: Yup.string().required('Permanent address is required'),
    secondaryAddress: Yup.string().optional(), // its.. optional
    citizenshipNo: Yup.string().required('Citizenship number is required'),
});
