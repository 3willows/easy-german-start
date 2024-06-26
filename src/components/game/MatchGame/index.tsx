'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Container, Flex, Text } from '@chakra-ui/react';
import Guide from '../Guide';
import { Lesson } from '../../../types/lesson';
import useScreen from '../../../hooks/useScreen';
import useTTS from '../../../hooks/useTTS';
import { shuffleArray } from '../../../libs/array';

interface MatchGameProps {
  lesson: Lesson;
  onClear: VoidFunction;
}

interface Word {
  word: string;
  desc: string;
}

interface IndicesPair {
  left: number;
  right: number;
}

type CardStatus = 'selected' | 'correct' | 'incorrect' | 'none';

const keyMapping = {
  left: ['q', 'w', 'e', 'r', 't'],
  right: ['a', 's', 'd', 'f', 'g'],
};

const initialIndicesPair = Object.freeze({
  left: -1,
  right: -1,
});

const MatchGame = ({ lesson, onClear }: MatchGameProps) => {
  const [words, setWords] = useState<Word[][]>([]);
  const [round, setRound] = useState(-1);
  const currentRoundWordPairs = useMemo<{ left: Word[]; right: Word[] }>(() => {
    if (round === -1 || words.length === 0 || words[0].length === 0)
      return { left: [], right: [] };

    const getRandomWords = () => {
      return shuffleArray([...words[round]]);
    };

    // left: German Words, right: English definitions
    return {
      left: getRandomWords(),
      right: getRandomWords(),
    };
  }, [round, words]);

  const handleClear = () => {
    const allRoundCleared = round === words.length - 1;
    if (allRoundCleared) {
      onClear();
      return;
    }

    setRound((prevRound) => prevRound + 1);
  };

  useEffect(() => {
    // An array in words has the {EACH_ROUND_WORD_CNT} numbers of words from lesson.words.
    const EACH_ROUND_WORD_CNT = 5;
    const newWords: Word[][] = [];

    const words = shuffleArray(lesson.words);
    let n = 0;

    while (n <= lesson.words.length) {
      newWords.push(
        words.slice(n, EACH_ROUND_WORD_CNT + n).map((w) => ({
          word: w.word,
          desc: w.desc,
        }))
      );

      n += EACH_ROUND_WORD_CNT;
    }

    setWords(newWords);
    setRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (round === -1) return <div>Loading...</div>;

  return (
    <Box bgColor="green.500" h="100%">
      <Guide message="Match the word with the correct description!" />
      <Container maxW="container.md" pt={[4, 16]} p={4}>
        <WordPairs
          left={currentRoundWordPairs.left}
          right={currentRoundWordPairs.right}
          onClear={handleClear}
        />
      </Container>
    </Box>
  );
};

const WordPairs = ({
  left,
  right,
  onClear,
}: {
  left: Word[];
  right: Word[];
  onClear: VoidFunction;
}) => {
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] =
    useState<IndicesPair>(initialIndicesPair);
  // When left and right doesn't match, the indices is stored here.
  const [prevIncorrectIndices, setPrevIncorrectIndices] =
    useState<IndicesPair>(initialIndicesPair);
  const { speak } = useTTS({ useRandomVoice: true });

  const resetPrevIncorrectIndicies = useCallback(() => {
    setPrevIncorrectIndices(initialIndicesPair);
  }, []);

  const resetSelectedIndicies = () => {
    setSelectedIndices(initialIndicesPair);
  };

  const elements = useMemo(() => {
    const _elements = [];

    const handleSelect =
      (type: 'left' | 'right', index: number, word: Word) => () => {
        const isSelected =
          (type === 'left' && index === selectedIndices.left) ||
          (type === 'right' && index === selectedIndices.right);
        const isCorrect = correctWords.includes(word.word);

        if (isSelected || isCorrect) return;

        setSelectedIndices((prevSelectedIndices) => ({
          ...prevSelectedIndices,
          [type]: index,
        }));
      };

    for (let i = 0; i < left.length; i++) {
      let leftStatus: CardStatus = 'none';
      leftStatus = prevIncorrectIndices.left === i ? 'incorrect' : leftStatus;
      leftStatus = selectedIndices.left === i ? 'selected' : leftStatus;
      leftStatus = correctWords.includes(left[i].word) ? 'correct' : leftStatus;

      let rightStatus: CardStatus = 'none';
      rightStatus =
        prevIncorrectIndices.right === i ? 'incorrect' : rightStatus;
      rightStatus = selectedIndices.right === i ? 'selected' : rightStatus;
      rightStatus = correctWords.includes(right[i].word)
        ? 'correct'
        : rightStatus;

      _elements.push(
        <Flex
          key={left[i].word}
          justifyContent="space-between"
          alignItems="center"
        >
          <Card
            shortcut={keyMapping.left[i]}
            value={left[i].word}
            status={leftStatus}
            onSelect={handleSelect('left', i, left[i])}
            onIncorrectAnimEnd={resetPrevIncorrectIndicies}
          />
          <Card
            shortcut={keyMapping.right[i]}
            value={right[i].desc}
            status={rightStatus}
            onSelect={handleSelect('right', i, right[i])}
            onIncorrectAnimEnd={resetPrevIncorrectIndicies}
          />
        </Flex>
      );
    }

    return _elements;
  }, [
    selectedIndices.left,
    selectedIndices.right,
    correctWords,
    left,
    prevIncorrectIndices.left,
    prevIncorrectIndices.right,
    right,
    resetPrevIncorrectIndicies,
  ]);

  useEffect(() => {
    if (selectedIndices.left === -1 || selectedIndices.right === -1) return;

    // when both words on the left side and the right side,
    // it decides it is correct or not.
    const isCorrect =
      left[selectedIndices.left].word === right[selectedIndices.right].word;
    if (isCorrect) {
      setCorrectWords((prevCorrectWords) => [
        ...prevCorrectWords,
        left[selectedIndices.left].word,
      ]);
    } else {
      // this state will be used to decide if the status of a card is incorrect
      // and when the status is incorrect, the care executes the incorrect animation.
      setPrevIncorrectIndices(selectedIndices);
    }

    resetSelectedIndicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndices]);

  useEffect(() => {
    setCorrectWords([]);
    resetPrevIncorrectIndicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, right]);

  useEffect(() => {
    const word = left[selectedIndices.left];
    if (!word) return;

    speak(word.word);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndices.left]);

  useEffect(() => {
    if (correctWords.length !== left.length) return;

    onClear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctWords]);

  return (
    <>
      <Shortcut />
      <Flex flexDir="column" rowGap={[4, 4, 12]}>
        {elements}
      </Flex>
    </>
  );
};

const Card = ({
  shortcut,
  value,
  status,
  onSelect,
  onIncorrectAnimEnd,
}: {
  shortcut: string;
  value: string;
  status: CardStatus;
  onSelect: VoidFunction;
  onIncorrectAnimEnd: VoidFunction;
}) => {
  const [incorrectAnim, setIncorrectAnim] = useState(false);
  const { isDesktop } = useScreen();
  const fontSize = value.length > 10 ? 'small' : 'large';

  const isHovable = isDesktop;
  const active = ['selected', 'correct'].includes(status);
  const bgColor = active ? 'blue.500' : 'white';
  const color = active ? 'white' : 'black';
  const p = active ? 2 : 4;

  useEffect(() => {
    // when the status is changed to `incorrect`, the animation will start once.
    setIncorrectAnim(status === 'incorrect');
  }, [status]);

  return (
    <Box
      id={getCardIdWithShortcut(shortcut)}
      onAnimationEnd={() => {
        setIncorrectAnim(false);
        onIncorrectAnimEnd();
      }}
      position="relative"
      className={incorrectAnim ? 'anim-incorrect-answer' : ''}
      p={p}
      minWidth="120px"
      maxWidth="40%"
      bgColor={bgColor}
      color={color}
      borderRadius="lg"
      fontSize={fontSize}
      textAlign="center"
      cursor="pointer"
      transition="all 0.25s"
      onClick={incorrectAnim ? undefined : onSelect}
      _hover={
        isHovable
          ? {
              bgColor: 'blue.500',
              color: 'white',
              fontWeight: 'bold',
              p: 2,
              ['> .shortcut']: {
                display: 'none',
              },
            }
          : undefined
      }
    >
      {value}
      <Box
        className="shortcut"
        position="absolute"
        display={active || incorrectAnim ? 'none' : ['none', 'none', 'block']}
        left="0%"
        top="0"
        transform="translate(0%,-50%)"
        textTransform="capitalize"
        px={2}
        py={1}
        borderRadius="md"
        bg="gray.200"
      >
        <Text fontSize="sm" color="black" fontWeight="bold">
          {shortcut}
        </Text>
      </Box>
    </Box>
  );
};

const Shortcut = () => {
  useEffect(() => {
    const keys = [...keyMapping.left, ...keyMapping.right];

    const handleKeyEvent = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!keys.includes(key)) return;

      const elmt = document.getElementById(getCardIdWithShortcut(key));
      if (elmt) elmt.click();
    };

    window.addEventListener('keyup', handleKeyEvent);

    return () => window.removeEventListener('keyup', handleKeyEvent);
  }, []);

  return null;
};

const getCardIdWithShortcut = (shortcut: string) => {
  return `card_${shortcut}`;
};

export default MatchGame;
