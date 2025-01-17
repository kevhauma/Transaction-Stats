import { Button, Step, Stepper } from '@/libs/shadCn';
import { useState } from 'react';
import { ImportDataStep } from './inputSteps/ImportDataStep';
import { useHistory } from '@/feature-data-store';
import Link from 'next/link';
import { stringToDate } from '@/feature-dates';
import { DebitFieldStep } from './inputSteps/DebitFieldStep';
import { DateFieldStep } from './inputSteps/DateFieldStep';
import { stringToFloat } from '@/libs/utils';
import { TransferFieldStep } from './inputSteps/TransferFieldStep';

export const NewReadData = () => {
  const { addEntries } = useHistory();

  const [csvData, setCsvData] = useState<Array<{ [k: string]: string }>>([]);

  const [fieldLegend, setFieldLegend] = useState<Array<string>>([]);

  const amountFieldState = useState<string>();
  const debitFieldState = useState<string>();
  const amountSeperatorState = useState<string>();
  const debitSeperatorState = useState<string>();

  const dateFieldState = useState<string>();
  const dateFormatState = useState<string>();

  const accountFieldState = useState<string>();
  const accountNameState = useState<string>();

  const recipientFieldState = useState<string>();
  const recipientNameState = useState<string>();

  const descriptionFieldState = useState<string>();

  const [amountField] = amountFieldState;
  const [debitField] = debitFieldState;
  const [amountSeperator] = amountSeperatorState;
  const [debitSeperator] = debitSeperatorState;

  const [dateField] = dateFieldState;
  const [dateFormat] = dateFormatState;

  const [accountField] = accountFieldState;
  const [accountName] = accountNameState;
  const [recipientField] = recipientFieldState;
  const [recipientName] = recipientNameState;
  const [descriptionField] = descriptionFieldState;

  const onReady = () => {
    if (
      !amountField ||
      !debitField ||
      !dateField ||
      !accountField ||
      !recipientField ||
      !accountName ||
      !recipientName ||
      !descriptionField
    )
      return;
    const entries = csvData.map((obj) => ({
      amount:
        stringToFloat(obj[amountField], amountSeperator || ',') ||
        stringToFloat(obj[debitField], debitSeperator || ',') ||
        0,
      date: stringToDate(obj[dateField], dateFormat),
      account: { identifier: obj[accountField], name: obj[accountName] },
      recipient: { identifier: obj[recipientField], name: obj[recipientName] },
      description: obj[descriptionField],
    }));

    addEntries(entries);
  };

  return (
    <div className="w-full">
      <Link replace href="/start">
        <Button>back</Button>
      </Link>
      <Stepper defaultStep="input" onSubmit={onReady}>
        <Step
          id="input"
          label="Import Data"
          isValid={Boolean(csvData.length && fieldLegend.length)}
        >
          <ImportDataStep
            csvData={csvData}
            onCsvChange={setCsvData}
            legendValue={fieldLegend}
            onLegendChange={setFieldLegend}
          />
        </Step>
        <Step id="debit" label="Debit Field" isValid={Boolean(amountField)}>
          <DebitFieldStep
            csvData={csvData}
            legendValue={fieldLegend}
            amountFieldState={amountFieldState}
            debitFieldState={debitFieldState}
            amountSeperatorState={amountSeperatorState}
            debitSeperatorState={debitSeperatorState}
          />
        </Step>
        <Step id="date" label="Date Field" isValid={Boolean(dateField)}>
          <DateFieldStep
            csvData={csvData}
            legendValue={fieldLegend}
            dateFieldState={dateFieldState}
            dateFormatState={dateFormatState}
          />
        </Step>
        <Step
          id="transfer"
          label="Transfer Field"
          isValid={Boolean(accountField && recipientField)}
        >
          <TransferFieldStep
            csvData={csvData}
            legendValue={fieldLegend}
            accountFieldState={accountFieldState}
            accountNameState={accountNameState}
            recipientFieldState={recipientFieldState}
            recipientNameState={recipientNameState}
            descriptionFieldState={descriptionFieldState}
          />
        </Step>
        <Step id="summary" label="Summary">
          Summary Field
        </Step>
      </Stepper>
    </div>
  );
};
