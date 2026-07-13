import * as Yup from 'yup'

export interface AuthFormValues {
  email: string
  password: string
}

export const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .trim()
    .required('Password is required'),
})