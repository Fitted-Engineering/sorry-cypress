import { CenteredContent } from '@sorry-cypress/dashboard/components';
import { Button } from 'bold-ui';
import React from 'react';
import { RunSummaryComponent } from '../runSummary/summary';
import { useGetRunsFeed } from './useGetRunFeed';

type RunListProps = {
  projectId: string;
  search?: string;
};

export const RunsFeed = ({ projectId, search = '' }: RunListProps) => {
  const [runsFeed, loadMore, loading, error] = useGetRunsFeed({
    projectId,
    search,
  });

  if (loading) {
    return <CenteredContent>Loading ...</CenteredContent>;
  }

  if (!runsFeed || error) {
    return <CenteredContent>{'Error loading data'}</CenteredContent>;
  }

  if (runsFeed.runs.length === 0) {
    if (search) {
      return (
        <CenteredContent>
          <p>No runs found</p>
        </CenteredContent>
      );
    }

    return (
      <CenteredContent>
        <p>No runs started yet</p>
      </CenteredContent>
    );
  }

  return (
    <>
      {runsFeed.runs.map((run) => (
        <RunSummaryComponent key={run.runId} run={run} />
      ))}
      {runsFeed.hasMore && <Button onClick={loadMore}>Load More</Button>}
    </>
  );
};
