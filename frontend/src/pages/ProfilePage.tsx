import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopFivePicker } from '@/components/dialogs/TopFivePicker';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ProfileHead } from '@/components/profile/ProfileHead';
import { ProfileLists } from '@/components/profile/ProfileLists';
import { TopFive } from '@/components/profile/TopFive';
import { ArrowButton } from '@/components/ui/ArrowLink';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { LineSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useSession } from '@/queries/auth';
import { useProfile } from '@/queries/profile';

export default function ProfilePage() {
  const { username } = useParams();
  const { user, partner } = useSession();
  const navigate = useNavigate();
  const profile = useProfile(username);
  const [picking, setPicking] = useState(false);
  const own = username === user.username;

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Whose profile"
        className="self-start"
        value={username ?? user.username}
        onChange={(u) => navigate(`/profile/${u}`)}
        options={[
          { value: user.username, label: user.displayName },
          { value: partner.username, label: partner.displayName },
        ]}
      />
      {profile.isPending ? (
        <div className="flex gap-4">
          <Skeleton className="h-[150px] w-[130px]" />
          <div className="flex-1">
            <LineSkeleton lines={4} />
          </div>
        </div>
      ) : profile.isError ? (
        <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      ) : (
        <>
          <ProfileHead p={profile.data} />
          <section aria-labelledby="top5-title" className="flex flex-col gap-3">
            <SectionHeader
              title={<span id="top5-title">Top 5</span>}
              right={own ? <ArrowButton onClick={() => setPicking(true)}>Edit</ArrowButton> : undefined}
            />
            <TopFive items={profile.data.topFive} />
          </section>
          <ProfileLists p={profile.data} own={own} />
          {picking && (
            <TopFivePicker
              username={user.username}
              current={profile.data.topFive}
              onClose={() => setPicking(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
