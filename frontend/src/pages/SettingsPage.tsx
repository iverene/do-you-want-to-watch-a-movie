import { useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { AppOptions } from '@/components/settings/AppOptions';
import { AvatarMaker } from '@/components/settings/AvatarMaker';
import { DisplayNameForm } from '@/components/settings/DisplayNameForm';
import { GenrePicker } from '@/components/settings/GenrePicker';
import { ImportSection } from '@/components/settings/ImportSection';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/queries/auth';
import { useUpdateMe } from '@/queries/me';
import { errorMessage, resetDemoData, serviceConfig } from '@/services';

function Block({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} sub={sub} />
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const update = useUpdateMe();
  const toast = useToast();
  const qc = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-pixel text-[22px] lg:text-[28px]">Settings</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Block title="Your avatar" sub="PIXEL AVATAR MAKER">
            <AvatarMaker key={user.id} initial={user.avatar} />
            <DisplayNameForm key={user.displayName} initial={user.displayName} />
          </Block>
          <Block title="Favorite genres" sub="FEEDS YOUR PICKS">
            <GenrePicker selected={user.favoriteGenreIds} />
          </Block>
        </div>
        <div className="flex flex-col gap-6">
          <Block title="App">
            <AppOptions />
          </Block>
          <Block title="Appearance">
            <Segmented
              label="Theme"
              className="self-start"
              value={theme}
              onChange={(t) => {
                setTheme(t);
                update.mutate({ theme: t }, { onError: (e) => toast.show(errorMessage(e), 'error') });
              }}
              options={[
                { value: 'light', label: '☼ Light' },
                { value: 'dark', label: '☾ Dark' },
              ]}
            />
          </Block>
          <Block title="Change password">
            <PasswordForm />
          </Block>
          <Block title="Import past watches">
            <ImportSection />
          </Block>
          {serviceConfig.mode === 'mock' && (
            <button
              type="button"
              className="self-start text-[12px] text-muted underline"
              onClick={() => setConfirmReset(true)}
            >
              Reset demo data
            </button>
          )}
        </div>
      </div>
      {confirmReset && (
        <ConfirmDialog
          title="Reset demo data"
          message="This puts the sample data back and removes everything logged in this browser. It can't be undone."
          confirmLabel="Reset"
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            resetDemoData();
            setConfirmReset(false);
            void qc.invalidateQueries();
            toast.show('Demo data reset');
          }}
        />
      )}
    </div>
  );
}
