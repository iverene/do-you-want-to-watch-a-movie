import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { DuoAvatars } from '@/components/pixel/DuoAvatars';
import { Field, TextInput } from '@/components/ui/Field';
import { LogWatchButton } from '@/components/ui/LogWatchButton';
import { Tag } from '@/components/ui/Tag';
import { useLogin, useMe } from '@/queries/auth';
import { errorMessage, type User } from '@/services';

const schema = z.object({
  username: z.string().trim().min(1, 'Enter your username.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
});
type Form = z.infer<typeof schema>;

// Two seats, before anyone signs in: generic avatars, no names.
const SEATS = [
  { id: 'seat-1', avatar: { style: 'short', hair: 0, skin: 0, top: 0, extra: 'none' } },
  { id: 'seat-2', avatar: { style: 'long', hair: 1, skin: 1, top: 1, extra: 'none' } },
] as unknown as User[];

function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function LoginPage() {
  const me = useMe();
  const login = useLogin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', remember: true },
  });

  if (me.data) return <Navigate to={next} replace />;

  const onSubmit = (v: Form) => login.mutate(v, { onSuccess: () => navigate(next, { replace: true }) });

  return (
    <main className="flex min-h-full items-center justify-center px-3 py-8">
      <div className="w-full max-w-[760px] rounded-[18px] bg-frame p-2 lg:rounded-[26px] lg:p-4">
        <div className="stitch flex flex-col gap-2 rounded-[12px] bg-inner p-2 md:flex-row lg:rounded-[18px] lg:p-3">
          <section className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-line bg-paper p-4 md:w-[270px] lg:rounded-[14px]">
            <DuoAvatars users={SEATS} scale={6} className="w-full" />
            <p className="font-hand text-[19px] text-ink">two seats saved. sign in to sit down.</p>
          </section>
          <section className="flex-1 rounded-[10px] border border-line bg-paper p-5 lg:rounded-[14px] lg:p-7">
            <p className="font-caps text-[11px] uppercase text-muted">MOVIE ROOM FOR TWO</p>
            <h1 className="mt-1 font-pixel text-[24px] leading-tight text-ink lg:text-[30px]">
              Do You Want to Watch a Movie?
            </h1>
            <div className="dotted-divider my-4" />
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
              <Field label="Username" error={formState.errors.username?.message}>
                {(a) => (
                  <TextInput
                    {...a}
                    {...register('username')}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoFocus
                  />
                )}
              </Field>
              <Field label="Password" error={formState.errors.password?.message}>
                {(a) => (
                  <TextInput
                    {...a}
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                  />
                )}
              </Field>
              <label className="flex min-h-11 items-center gap-2 text-[13px]">
                <input type="checkbox" {...register('remember')} className="h-4 w-4 accent-[var(--tab)]" />
                Keep me signed in
              </label>
              {login.isError && (
                <p role="alert" className="border border-dashed border-red px-3 py-2 text-[13px] text-red">
                  {errorMessage(login.error)}
                </p>
              )}
              <LogWatchButton type="submit" icon="▶" disabled={login.isPending} className="self-start">
                {login.isPending ? 'Opening..' : 'Come in'}
              </LogWatchButton>
            </form>
            <p className="mt-5 flex items-center gap-2 text-[12px] text-muted">
              <Tag>PRIVATE</Tag> Only two people have a key to this room.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
