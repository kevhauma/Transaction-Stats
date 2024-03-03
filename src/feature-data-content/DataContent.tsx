'use client';
import dayjs from 'dayjs';
import { Flex } from 'antd';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { ReadData } from './ReadData';
import { useHistory } from '@/feature-data-store';
import { dateToString, stringToDate } from '@/feature-dates';
import { useMemo, useState } from 'react';
import { AccountHistoryEntryType } from '@/types';
const account_start_saldo = {
  BE55731028883844: 1669.18,
  BE70746031270525: 6970.55,
};
const colors = ['rgb(255, 70, 131)', 'rgb(151, 151,10)', 'rgb(255, 70, 0)'];
type PreGraphEntryType = { difference: number; date: dayjs.Dayjs };
type GraphEntryType = [string, number];
export const DataContent = () => {
  const { getHistory, addEntries } = useHistory();
  const [zoomFilter, setZoomFilter] = useState<{
    from: dayjs.Dayjs;
    to: dayjs.Dayjs;
  } | null>(null);

  console.time('getHistory');
  const historyEntries = getHistory();
  console.timeEnd('getHistory');

  const series = useMemo(() => {
    const startDate = historyEntries[0]?.date;
    const endDate = historyEntries[historyEntries.length - 1]?.date;

    console.time('grouping');
    const groupedByAccount: Record<string, AccountHistoryEntryType[]> =
      Object.groupBy(historyEntries, (entry) => entry.account);
    console.timeEnd('grouping');
    console.time('blank-filling');
    const precalcSeries: Record<string, PreGraphEntryType[]> = {};

    for (
      let date = dayjs(startDate);
      endDate?.isAfter(date);
      date = date.add(1, 'day')
    ) {
      Object.entries(groupedByAccount).map(([account, entries]) => {
        let dateTransactions = entries.filter(
          ({ date: entryDate, account: entryAccount }) =>
            date.isSame(entryDate) && account === entryAccount
        );
        if (!precalcSeries[account])
          precalcSeries[account] = [] as PreGraphEntryType[];
        if (dateTransactions.length == 0)
          precalcSeries[account].push({ difference: 0, date });
        else
          precalcSeries[account].push({
            difference: dateTransactions.reduce(
              (total, curr) => total + curr.amount,
              0
            ),
            date,
          });
      });
    }
    console.timeEnd('blank-filling');
    console.time('lists');

    const internalSeries = Object.entries(precalcSeries).map(
      ([account, entries]) => {
        const list = entries.reduce(
          (total, entry) => [
            ...total,
            [
              dateToString(entry.date) || '',
              parseFloat(
                (
                  entry.difference +
                  (total[total.length - 1]?.[1] || account_start_saldo[account])
                ).toFixed(2)
              ),
            ] as GraphEntryType,
          ],
          [] as Array<GraphEntryType>
        );
        return { account, list };
      }
    );
    console.timeEnd('lists');

    return internalSeries.toSorted((a, b) => (a.account > b.account ? -1 : 1));
  }, [historyEntries]);

  const onDataZoom = ({ start, end }: { start: number; end: number }) => {
    console.log({ start, end });
  };

  //console.log(series1)
  //console.log(dates, amounts);

  const options: EChartsOption = {
    tooltip: {
      backgroundColor: 'rgba(242, 242, 242, 0.75)',
      textStyle: {
        color: '#000000',
      },
      trigger: 'axis',
    },
    title: {
      left: 'center',
      text: 'Graph',
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        formatter: (value: string) => dateToString(stringToDate(value)),
      },
    },
    yAxis: {
      type: 'value',
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { start: 0, end: 100 },
    ],
    series: series.map(({ account, list }, index) => ({
      name: account,
      type: 'line',
      stack: 'x',
      stackStrategy: 'all',
      symbol: 'none',
      connectNulls: true,
      markLine: {
        silent: true,
        symbol: 'none',
      },
      itemStyle: {
        color: colors[index % colors.length],
      },
      data: list,
    })),
  };

  return (
    <Flex vertical>
      <ReadData onReady={(data) => addEntries(data)} />
      <ReactECharts option={options} onEvents={{ dataZoom: onDataZoom }} />
    </Flex>
  );
};
