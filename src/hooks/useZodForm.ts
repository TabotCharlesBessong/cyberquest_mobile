import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React from 'react';
import { FormProvider } from '@/components/FormComponents';

type FormMethods = {
  control: any;
  handleSubmit: any;
  reset: any;
  getValues: any;
  setValue: any;
  formState: { errors: any };
  watch: any;
};

type ZodSchema<T extends z.ZodTypeAny> = T;

export function useZodForm<T extends ZodSchema<any>>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
): UseFormReturn<z.infer<T>> & { FormProvider: React.FC<{ children: React.ReactNode }> } {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as z.infer<T>,
    mode: 'onBlur',
  });

  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(FormProvider, { form: form as FormMethods, children });

  return Object.assign(form, { FormProvider: Provider });
}
