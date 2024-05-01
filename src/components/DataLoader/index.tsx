import { Button, Flex, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useRef } from 'react';
import useHistory from '../../hooks/useHistory';
import { downloadURIAsFile } from '../../libs/file';

const DataLoader = () => {
  const { getHistories, setHistories, clearHistories } = useHistory();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const readFile = (file: File): Promise<string> => {
      const fileReader = new FileReader();
      fileReader.readAsText(file);

      return new Promise((resolve, reject) => {
        fileReader.onload = () => {
          resolve(fileReader.result as string);
        };
        fileReader.onerror = () => {
          reject('Failed to read file');
        };
      });
    };

    const file = e.target.files[0];
    const jsonText = await readFile(file);
    importData(jsonText);
  };

  const importData = (json: string) => {
    try {
      const histories = JSON.parse(json);
      setHistories(histories);
    } catch {
      alert('Failed to import the file. Check if you uplaoded a correct file.');
    }
  };

  const exportData = () => {
    const histories = JSON.stringify(getHistories());
    const filename = `${dayjs().utc().format('YYYYMMDD')}_easygermanstart.json`;
    const historiesFileURL = URL.createObjectURL(new Blob([histories]));

    downloadURIAsFile(filename, historiesFileURL, { revokeURI: true });
  };

  const reset = () => {
    if (
      confirm(
        'Do you reallt want to reset all the data? you can restore it once you reset.'
      )
    ) {
      clearHistories();
    }
  };

  return (
    <Flex justifyContent="flex-end" alignItems="center" gap={2}>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        style={{
          display: 'none',
        }}
      />
      <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
        Data
      </Text>
      <Button
        colorScheme="linkedin"
        size="sm"
        onClick={() => {
          fileRef.current?.click();
        }}
      >
        Import
      </Button>
      <Button colorScheme="whatsapp" size="sm" onClick={exportData}>
        Export
      </Button>
      <Button colorScheme="red" size="sm" onClick={reset}>
        Reset
      </Button>
    </Flex>
  );
};

export default DataLoader;
