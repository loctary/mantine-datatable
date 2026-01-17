import { RowGroupingExample } from './RowGroupingExample';
import { PageTitle } from '~/components/PageTitle';
import type { Route } from 'next';
import { PageNavigation } from '~/components/PageNavigation';
import { CodeBlock } from '~/components/CodeBlock';
import { readCodeFile } from '~/lib/code';
import { getRouteMetadata } from '~/lib/utils';

const PATH: Route = '/examples/row-grouping';

export const metadata = getRouteMetadata(PATH);

export default async function BasicUsageExamplePage() {
  const code = await readCodeFile(`${PATH}/RowGroupingExample.tsx`);

  return (
    <>
      <PageTitle of={PATH} />
      <div style={{ height: 400 }}>
        <RowGroupingExample />
      </div>

      <CodeBlock code={code} />
      <PageNavigation of={PATH} />
    </>
  );
}
