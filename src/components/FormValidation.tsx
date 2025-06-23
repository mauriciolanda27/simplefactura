import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

// Tipos de validación
export type ValidationRule = {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'nit' | 'amount' | 'date' | 'file';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Reglas de validación predefinidas
export const validationRules = {
  required: (message = 'Este campo es obligatorio'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message = 'Ingrese un email válido'): ValidationRule => ({
    type: 'pattern',
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Mínimo ${length} caracteres`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Máximo ${length} caracteres`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),
  
  nit: (message = 'NIT debe tener 7-11 dígitos'): ValidationRule => ({
    type: 'pattern',
    value: /^\d{7,11}$/,
    message
  }),
  
  amount: (message = 'Monto debe ser un número válido'): ValidationRule => ({
    type: 'pattern',
    value: /^\d+(\.\d{1,2})?$/,
    message
  }),
  
  date: (message = 'Fecha debe ser válida'): ValidationRule => ({
    type: 'custom',
    message,
    validator: (value) => {
      if (!value) return false;
      const date = new Date(value as string);
      return !isNaN(date.getTime()) && date <= new Date();
    }
  }),
  
  file: (maxSize: number, allowedTypes: string[], message?: string): ValidationRule => ({
    type: 'custom',
    message: message || `Archivo debe ser menor a ${maxSize / 1024 / 1024}MB y tipo: ${allowedTypes.join(', ')}`,
    validator: (file) => {
      if (!file || !(file instanceof File)) return false;
      const isValidType = allowedTypes.some(type => file.type.includes(type));
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    }
  })
};

// Función de validación principal
export function validateField(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    let isValid = true;
    
    switch (rule.type) {
      case 'required':
        isValid = value !== null && value !== undefined && value !== '';
        break;
        
      case 'email':
        isValid = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
        
      case 'minLength':
        isValid = typeof value === 'string' && value.length >= (rule.value as number);
        break;
        
      case 'maxLength':
        isValid = typeof value === 'string' && value.length <= (rule.value as number);
        break;
        
      case 'pattern':
        isValid = typeof value === 'string' && (rule.value as RegExp).test(value);
        break;
        
      case 'custom':
        isValid = rule.validator ? rule.validator(value) : true;
        break;
        
      case 'nit':
        isValid = typeof value === 'string' && /^\d{7,11}$/.test(value);
        break;
        
      case 'amount':
        isValid = typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value) && parseFloat(value) > 0;
        break;
        
      case 'date':
        if (value) {
          const date = new Date(value as string);
          isValid = !isNaN(date.getTime()) && date <= new Date();
        }
        break;
        
      case 'file':
        if (value instanceof File) {
          isValid = rule.validator ? rule.validator(value) : true;
        }
        break;
    }
    
    if (!isValid) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Hook para validación de campo
export function useFieldValidation(initialValue: unknown, rules: ValidationRule[]) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  
  useEffect(() => {
    if (touched) {
      const result = validateField(value, rules);
      setValidation(result);
    }
  }, [value, touched, rules]);
  
  const handleChange = (newValue: unknown) => {
    setValue(newValue);
    if (!touched) setTouched(true);
  };
  
  const handleBlur = () => {
    setTouched(true);
  };
  
  const reset = () => {
    setValue(initialValue);
    setTouched(false);
    setValidation({ isValid: true, errors: [] });
  };
  
  return {
    value,
    setValue: handleChange,
    touched,
    validation,
    handleBlur,
    reset,
    isValid: validation.isValid,
    errors: validation.errors,
    hasError: touched && !validation.isValid
  };
}

// Componente TextField con validación integrada
interface ValidatedTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  validation: ReturnType<typeof useFieldValidation>;
  onChange?: (value: string) => void;
}

export function ValidatedTextField({ 
  validation, 
  onChange, 
  onBlur,
  error,
  helperText,
  ...textFieldProps 
}: ValidatedTextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validation.setValue(e.target.value);
    onChange?.(e.target.value);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validation.handleBlur();
    onBlur?.(e);
  };
  
  return (
    <Box>
      <TextField
        {...textFieldProps}
        value={validation.value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error || validation.hasError}
        helperText={helperText || (validation.hasError ? validation.errors[0] : '')}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
              transform: 'scale(1.02)',
            },
            '&.Mui-error': {
              animation: 'shake 0.5s ease-in-out',
            }
          }
        }}
      />
    </Box>
  );
}

// Hook para validación de formulario completo
export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule[]>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  
  const validateFormField = (field: keyof T, value: unknown) => {
    const rules = validationSchema[field];
    if (!rules) return { isValid: true, errors: [] };
    
    return validateField(value, rules);
  };
  
  const validateForm = () => {
    const newErrors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
    let isValid = true;
    
    Object.keys(validationSchema).forEach((key) => {
      const field = key as keyof T;
      const result = validateFormField(field, values[field]);
      newErrors[field] = result.errors;
      if (!result.isValid) isValid = false;
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const setValue = (field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validar campo si ya fue tocado
    if (touched[field]) {
      const result = validateFormField(field, value);
      setErrors(prev => ({ ...prev, [field]: result.errors }));
    }
  };
  
  const setTouchedField = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo al tocarlo
    const result = validateFormField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: result.errors }));
  };
  
  const reset = () => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
    setErrors({} as Record<keyof T, string[]>);
  };
  
  const getFieldError = (field: keyof T) => {
    return touched[field] ? errors[field]?.[0] || '' : '';
  };
  
  const hasFieldError = (field: keyof T) => {
    return touched[field] && errors[field]?.length > 0;
  };
  
  return {
    values,
    setValue,
    touched,
    setTouchedField,
    errors,
    validateForm,
    reset,
    getFieldError,
    hasFieldError,
    isValid: Object.keys(errors).every(key => !errors[key as keyof T]?.length)
  };
}

interface ValidatedSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  rules: ValidationRule[];
  disabled?: boolean;
  fullWidth?: boolean;
  showValidation?: boolean;
}

export const ValidatedSelectField: React.FC<ValidatedSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  rules,
  disabled = false,
  fullWidth = true,
  showValidation = true
}) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || value) {
      const result = validateField(value, rules);
      setValidation(result);
    }
  }, [value, rules, touched]);

  const handleChange = (event: any) => {
    onChange(event.target.value as string);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getValidationIcon = () => {
    if (!showValidation || !touched) return null;

    if (validation.isValid) {
      return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
    } else {
      return <Error sx={{ color: 'error.main', fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <FormControl fullWidth={fullWidth} error={touched && !validation.isValid}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          label={label}
          disabled={disabled}
          sx={{ borderRadius: 0 }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {getValidationIcon() && (
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {getValidationIcon()}
        </Box>
      )}
      {touched && validation.errors.length > 0 && (
        <Typography
          variant="caption"
          color="error.main"
          sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
        >
          {validation.errors[0]}
        </Typography>
      )}
    </Box>
  );
}; 