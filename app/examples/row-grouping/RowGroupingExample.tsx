'use client';

import { DataTable } from '__PACKAGE__';
import companies from '~/data/companies.json';
import { useState } from 'react';

export function RowGroupingExample() {
  const [selectedRecords, setSelectedRecords] = useState<typeof companies>([]);

  return (
    <DataTable
      withTableBorder
      withColumnBorders
      striped
      records={companies}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      columns={[
        {
          accessor: 'state',
          width: 100,
          rowGroup: true,
          hidden: true,

        },
        { accessor: 'city', width: 150, rowGroup: true, hidden: true },
        { accessor: 'name', width: 200 },
        {
          accessor: 'missionStatement',
          width: 200,
          aggFunc: (value) => {
            return (value as string[]).map((v) => v[0]);
          },
        },
        { accessor: 'revenue', width: 150, aggFunc: (v) => (v as number[]).reduce((acc, v) => acc + v, 0) },
      ]}
      height={400}
      groupColumn={{
        width: 200,
        title: 'Group',
        footer: 'Group column footer',
        render: () => 'Row',
        rowGroupRender: (v, r) => `group ${v} (${r.length})`,
      }}
    />
  );
}
