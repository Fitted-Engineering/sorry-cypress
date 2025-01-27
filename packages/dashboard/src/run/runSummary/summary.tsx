import {
  ArrayItemType,
  getRunClaimedSpecsCount,
  getRunDurationSeconds,
  getRunOverallSpecsCount,
  getRunTestsProgress,
} from '@sorry-cypress/common';
import {
  CiUrl,
  FormattedDate,
  HeaderLink,
  Paper,
  TestFailureBadge,
  TestOverallBadge,
  TestRetriesBadge,
  TestSkippedBadge,
  TestSuccessBadge,
} from '@sorry-cypress/dashboard/components/';
import { Duration } from '@sorry-cypress/dashboard/components/common/duration';
import {
  GetRunQuery,
  GetRunsFeedQuery,
  RunProgressFragment,
} from '@sorry-cypress/dashboard/generated/graphql';
import { getDurationMs } from '@sorry-cypress/dashboard/lib/duration';
import { Cell, Grid, HFlow, Icon, Text, Tooltip } from 'bold-ui';
import { parseISO } from 'date-fns';
import React from 'react';
import { Commit } from '../commit';
import { DeleteRunButton } from '../deleteRun/deleteRunButton';

export function RunSummaryComponent({
  run,
}: {
  run: GetRunQuery['run'] | ArrayItemType<GetRunsFeedQuery['runFeed']['runs']>;
}) {
  if (!run) {
    return null;
  }
  const runId = run.runId;
  const runMeta = run.meta;
  const runCreatedAt = run.createdAt;
  const hasCompletion = !!run.completion;
  const completed = !!run.completion?.completed;
  const inactivityTimeoutMs = run.completion?.inactivityTimeoutMs;

  if (!run.progress) {
    return <Pre_2_0_0_Run run={run} />;
  }

  const overallSpecsCount = getRunOverallSpecsCount(run.progress);
  const claimedSpecsCount = getRunClaimedSpecsCount(run.progress);
  const durationSeconds = getRunDurationSeconds(
    parseISO(run.createdAt),
    run.progress?.updatedAt ? parseISO(run.progress?.updatedAt) : null,
    run.completion?.inactivityTimeoutMs ?? null
  );

  return (
    <Paper>
      <HFlow alignItems="center" justifyContent="space-between">
        <div style={{ flex: 1 }}>
          <HFlow alignItems="center">
            {hasCompletion && (
              <RunStatus
                completed={completed}
                inactivityTimeoutMs={inactivityTimeoutMs}
              />
            )}
            <HeaderLink to={`/run/${runId}`}>{runMeta.ciBuildId}</HeaderLink>
          </HFlow>
        </div>
        <DeleteRunButton runId={runId} ciBuildId={runMeta.ciBuildId} />
      </HFlow>
      <Grid>
        <Cell xs={12} md={6}>
          <div>
            <strong>Execution details</strong>
          </div>
          <ul>
            <li>
              <Text>
                Started At: <FormattedDate value={parseISO(runCreatedAt)} />
              </Text>
            </li>
            <li>
              <Text>Duration: </Text>
              <Duration
                completion={run.completion ?? undefined}
                createdAtISO={runCreatedAt}
                wallClockDurationSeconds={durationSeconds}
              />
            </li>
            <li>
              <Text>Spec Files: </Text>
              <Text>
                {claimedSpecsCount} / {overallSpecsCount}
              </Text>
            </li>
          </ul>
        </Cell>
        <Cell xs={12} md={6}>
          <Commit commit={runMeta?.commit} />
          <CiUrl
            ciBuildId={runMeta?.ciBuildId}
            projectId={runMeta?.projectId}
          />
        </Cell>
      </Grid>

      {run.progress && <RunSummaryTestResults runProgress={run.progress} />}
    </Paper>
  );
}
function RunSummaryTestResults({
  runProgress,
}: {
  runProgress: RunProgressFragment;
}) {
  const testsProgress = getRunTestsProgress(runProgress);
  return (
    <HFlow>
      <TestOverallBadge value={testsProgress.overall} />
      <TestSuccessBadge value={testsProgress.passes} />
      <TestFailureBadge value={testsProgress.failures} />
      <TestSkippedBadge value={testsProgress.pending} />
      <TestRetriesBadge value={testsProgress.retries} />
    </HFlow>
  );
}

function RunStatus({
  completed,
  inactivityTimeoutMs,
}: {
  completed: boolean;
  inactivityTimeoutMs?: number | null;
}) {
  if (!completed) {
    return (
      <Tooltip text={`Run is being executed`}>
        <Icon icon="rocket" fill="info" stroke="info" size={1} />
      </Tooltip>
    );
  }
  if (inactivityTimeoutMs) {
    return <Timedout inactivityTimeoutMs={inactivityTimeoutMs} />;
  }
  return null;
}

function Timedout({ inactivityTimeoutMs }: { inactivityTimeoutMs: number }) {
  return (
    <Tooltip
      text={`Timed out after ${getDurationMs(
        inactivityTimeoutMs
      )}. Set the timeout value in project settings.`}
    >
      <Icon icon="clockOutline" fill="danger" stroke="danger" size={0.9} />
    </Tooltip>
  );
}

const Pre_2_0_0_Run = ({
  run,
}: {
  run: GetRunQuery['run'] | ArrayItemType<GetRunsFeedQuery['runFeed']['runs']>;
}) => {
  if (!run) {
    return null;
  }
  const runId = run.runId;
  const runMeta = run.meta;

  return (
    <Paper>
      <HFlow alignItems="center" justifyContent="space-between">
        <div style={{ flex: 1 }}>
          <HFlow alignItems="center">
            <Tooltip text="This is a legacy run created prior to Sorry Cypress 2.0. Some information may be missing.">
              <Icon icon="archiveFilled" size={1} />
            </Tooltip>
            <HeaderLink to={`/run/${runId}`}>{runMeta.ciBuildId}</HeaderLink>
          </HFlow>
        </div>
        <DeleteRunButton runId={runId} ciBuildId={runMeta.ciBuildId} />
      </HFlow>
      <Grid>
        <Cell xs={12} md={6}>
          <Commit commit={runMeta?.commit} />
          <CiUrl
            ciBuildId={runMeta?.ciBuildId}
            projectId={runMeta?.projectId}
          />
        </Cell>
      </Grid>
    </Paper>
  );
};
