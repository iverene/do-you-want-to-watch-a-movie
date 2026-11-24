import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUpdateMe } from '@/queries/me';
import { errorMessage, isApiError } from '@/services';
import { BevelButton } from '../ui/BevelButton';
import { Field, TextInput } from '../ui/Field';
import { useToast } from '../ui/Toast';

const schema = z.object({
  displayName: z.string().trim().min(1, 'Add a name.').max(30, 'Use 30 characters or fewer.'),
});

export function DisplayNameForm({ initial }: { initial: string }) {
  const update = useUpdateMe();
  const toast = useToast();
  const { register, handleSubmit, formState, setError } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: initial },
  });
  return (
    <form
      noValidate
      className="flex items-end gap-2"
      onSubmit={handleSubmit((v) =>
        update.mutate(v, {
          onSuccess: () => toast.show('Name saved'),
          onError: (e) =>
            setError('displayName', {
              message: isApiError(e) && e.fields?.displayName ? e.fields.displayName : errorMessage(e),
            }),
        }),
      )}
    >
      <Field label="Display name" error={formState.errors.displayName?.message} className="flex-1">
        {(a) => <TextInput {...a} {...register('displayName')} autoComplete="nickname" />}
      </Field>
      <BevelButton
        type="submit"
        disabled={update.isPending}
        className={formState.errors.displayName ? 'mb-5' : ''}
      >
        Save
      </BevelButton>
    </form>
  );
}
