import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useChangePassword } from '@/queries/me';
import { errorMessage, isApiError } from '@/services';
import { BevelButton } from '../ui/BevelButton';
import { Field, TextInput } from '../ui/Field';
import { useToast } from '../ui/Toast';

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(10, 'Use at least 10 characters.'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: "The passwords don't match." });
type Form = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const change = useChangePassword();
  const toast = useToast();
  const { register, handleSubmit, formState, setError, reset } = useForm<Form>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });
  const onSubmit = (v: Form) =>
    change.mutate(
      { currentPassword: v.currentPassword, newPassword: v.newPassword },
      {
        onSuccess: () => {
          reset();
          toast.show('Password changed. Your other sessions were signed out.');
        },
        onError: (e) => {
          if (isApiError(e) && e.fields)
            for (const [k, m] of Object.entries(e.fields)) setError(k as keyof Form, { message: m });
          else setError('root', { message: errorMessage(e) });
        },
      },
    );
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field label="Current password" error={formState.errors.currentPassword?.message}>
        {(a) => (
          <TextInput
            {...a}
            {...register('currentPassword')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Field label="New password" note="min. 10 characters" error={formState.errors.newPassword?.message}>
        {(a) => <TextInput {...a} {...register('newPassword')} type="password" autoComplete="new-password" />}
      </Field>
      <Field label="Confirm new password" error={formState.errors.confirm?.message}>
        {(a) => <TextInput {...a} {...register('confirm')} type="password" autoComplete="new-password" />}
      </Field>
      {formState.errors.root && <p className="text-[13px] text-red">{formState.errors.root.message}</p>}
      <BevelButton type="submit" disabled={change.isPending} className="self-start">
        Change password
      </BevelButton>
    </form>
  );
}
