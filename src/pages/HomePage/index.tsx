import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import DefaultTemplate from '../../components/common/DefaultTemplate';
import FirstImage from './res/a.webp';
import SecondImage from './res/b.webp';
import ThirdImage from './res/c.webp';
import FourthImage from './res/d.webp';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Lesson } from '../../types/lesson';
import MatchGame from '../../components/game/MatchGame';
import IntroCard from '../../components/home/IntroCard';
import { getImgUrlWithBaseUrl } from '../../libs/const';
import BlankFillGame from '../../components/game/BlankFillGame';
import TranslationPuzzleGame from '../../components/game/TranslationPuzzleGame';
import Certificate from '../../components/common/Certificate';
import dayjs from 'dayjs';
import DataLoader from '../../components/common/DataLoader';
import { FaGithub, FaQuestion } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <DefaultTemplate disablePadding>
      <EntrySection />
      <IntroSection />
      <DemoSection />
      <DataLoaderGuide />
      <ContributionGuide />
    </DefaultTemplate>
  );
}

const ImageRow = styled(Flex)`
  height: 50%;

  > img {
    flex: 1;
    max-width: 50%;
    height: 100%;
    object-fit: cover;
  }
`;

function EntrySection() {
  const imgs = [FirstImage, SecondImage, ThirdImage, FourthImage];
  // imgIndices means, the range of images is from 0 to 3.
  const [imgIndices, setImgIndices] = useState([0, 1, 2, 3]); // image index(ranging from 0 to 3 of [0: top left, 1: top right, 2: bottom left, 3: bottom right]
  const [animImgIndex, setAnimImgIndex] = useState(-1);
  const tmRef = useRef<{ tmChangeImg: NodeJS.Timeout | undefined }>({
    tmChangeImg: undefined,
  });
  const prevRandomIdx = useRef<number>(-1); // prevent to change the same image.

  const handleAnimEnd = () => setAnimImgIndex(-1);

  const changeImg = () => {
    tmRef.current.tmChangeImg = setTimeout(
      () => {
        // 0: top left, 1: top right, 2: bottom left, 3: bottom right
        let randomIdx: number;

        do {
          randomIdx = Math.floor(Math.random() * imgIndices.length);
        } while (prevRandomIdx.current === randomIdx);
        prevRandomIdx.current = randomIdx;

        setImgIndices((prevImgIndices) => {
          const newImgIndices = [...prevImgIndices];
          const nextRandImgIdx = Math.floor(Math.random() * imgs.length);
          newImgIndices[randomIdx] = nextRandImgIdx;
          return newImgIndices;
        });

        setAnimImgIndex(randomIdx);
      },
      1000 + Math.floor(Math.random() * 500)
    );
  };

  useEffect(() => {
    if (animImgIndex === -1) changeImg();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animImgIndex]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(tmRef.current.tmChangeImg);
    };
  }, []);

  return (
    <Flex
      position="relative"
      overflowY="hidden"
      minH="calc(100svh - 64px)"
      justifyContent="center"
      alignItems="center"
    >
      <Flex
        position="absolute"
        flexDir="column"
        width="100%"
        height="100%"
        opacity={0.3}
      >
        <ImageRow>
          <Image
            alt="learn german"
            src={imgs[imgIndices[0]]}
            className={animImgIndex === 0 ? 'anim-entry-image-change' : ''}
            onAnimationEnd={handleAnimEnd}
          />
          <Image
            alt="learn german"
            src={imgs[imgIndices[1]]}
            className={animImgIndex === 1 ? 'anim-entry-image-change' : ''}
            onAnimationEnd={handleAnimEnd}
          />
        </ImageRow>
        <ImageRow>
          <Image
            alt="learn german"
            src={imgs[imgIndices[2]]}
            className={animImgIndex === 2 ? 'anim-entry-image-change' : ''}
            onAnimationEnd={handleAnimEnd}
          />
          <Image
            alt="learn german"
            src={imgs[imgIndices[3]]}
            className={animImgIndex === 3 ? 'anim-entry-image-change' : ''}
            onAnimationEnd={handleAnimEnd}
          />
        </ImageRow>
      </Flex>
      <Text
        zIndex={1}
        fontSize={['xx-large', 'xxx-large']}
        color="#fff"
        textShadow="0 0 7px #fff,
      0 0 10px #fff,
      0 0 21px #ffce00,
      0 0 42px #000,
      0 0 82px #ff0000,
      0 0 92px #ffce00,
      0 0 102px #ff0000,
      0 0 151px #ffce00"
      >
        Don't Study, Enjoy It
      </Text>
    </Flex>
  );
}

const IntroCardWrapper = styled(Flex)`
  > div {
    visibility: hidden;
  }
`;

function IntroSection() {
  useEffect(() => {
    let animating = false;
    const animFuncQueue: VoidFunction[] = [];

    const executeAnimFuncFromQueue = () => {
      if (animFuncQueue.length <= 0 || animating) return;
      animating = true;
      animFuncQueue.shift()?.();
    };

    const appendAnimFuncToQueue = (func: VoidFunction) => {
      animFuncQueue.push(func);
      executeAnimFuncFromQueue();
    };

    const handleAnimationEnd = (e: AnimationEvent) => {
      (e.target as HTMLElement).style.visibility = 'visible';
      animating = false;
      executeAnimFuncFromQueue();
    };

    const addSlideAnim = (
      anim: 'left-to-right' | 'right-to-left',
      className: string
    ) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              appendAnimFuncToQueue(() => {
                entry.target.classList.add(`anim-slide-${anim}`);
              });
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.5,
        }
      );

      const elmt = document.querySelector<HTMLElement>(`.${className}`);

      if (elmt) {
        elmt.addEventListener('animationend', handleAnimationEnd);
        observer.observe(elmt);
      }

      return () => {
        observer.disconnect();
      };
    };

    const disposals = [
      addSlideAnim('left-to-right', 'intro-1'),
      addSlideAnim('right-to-left', 'intro-2'),
      addSlideAnim('left-to-right', 'intro-3'),
      addSlideAnim('right-to-left', 'intro-4'),
    ];

    return () => {
      disposals.forEach((disposal) => disposal());
    };
  }, []);

  return (
    <Container maxW="container.lg" pt={[24, 32]} pb={[24, 32]}>
      <IntroCardWrapper flexDir="column" gap={[16, 24]}>
        <IntroCard
          className="intro-1"
          imgAlign="right"
          imgSrc={getImgUrlWithBaseUrl('/imgs/intro_1.png')}
          title="Easy To Follow"
          list={[
            'Top 1000 common German words.',
            'Optimal lesson length for retention.',
            'Engage in various quiz types.',
            'TTS support for Listening Practice.',
          ]}
        />
        <IntroCard
          className="intro-2"
          imgSrc={getImgUrlWithBaseUrl('/imgs/intro_2.png')}
          title="Interactive Learning"
          desc="Enjoy engaging quizzes and desktop shortcuts."
        />
        <IntroCard
          className="intro-3"
          imgAlign="right"
          imgSrc={getImgUrlWithBaseUrl('/imgs/intro_4.png')}
          title="Track Progress"
          list={[
            'local-based data storage, import and export your data!',
            'Monitor activities and stay motivated.',
            'Maintain a daily learning streak.',
          ]}
        />
        <IntroCard
          className="intro-4"
          imgSrc={getImgUrlWithBaseUrl('/imgs/intro_3.png')}
          title="Certificate"
          desc="Receive a certificate upon completing lessons!"
        />
      </IntroCardWrapper>
    </Container>
  );
}

function DemoSection() {
  const [screenStep, setScreenStep] = useState(0);
  const [lesson] = useState<Lesson>(() => ({
    lessonTitle: 'title',
    lessonDesc: 'desc',
    words: [
      {
        word: 'Hallo',
        desc: 'Hello',
        examples: [
          {
            sentence: 'Hallo! Wie geht es dir?',
            translation: 'Hello! How are you?',
          },
          {
            sentence: 'Hallo! Ich komme aus Deutschland.',
            translation: 'Hello! I come from Germany.',
          },
        ],
      },
      {
        word: 'Tschüss',
        desc: 'Bye',
        examples: [
          {
            sentence: 'Hallo! Tschüss!',
            translation: 'Hello! Goodbye!',
          },
          {
            sentence: 'Tschüss! Bis später!',
            translation: 'Goodbye! See you later!',
          },
        ],
      },
    ],
  }));

  const nextScreen = () => setScreenStep((prevStep) => prevStep + 1);

  const screen = useMemo(() => {
    switch (screenStep) {
      case 0:
        return (
          <Flex
            h="100%"
            bgColor="green.500"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            p={4}
            gap={4}
          >
            <Text
              fontSize={['x-large', 'xx-large']}
              color="white"
              textAlign="center"
              fontWeight="bold"
              textTransform="uppercase"
            >
              You want to try a lesson?
            </Text>
            <Button
              size="lg"
              colorScheme="twitter"
              width="fit-content"
              onClick={nextScreen}
            >
              YES
            </Button>
          </Flex>
        );
      case 1:
        return <MatchGame lesson={lesson} onClear={nextScreen} />;
      case 2:
        return <BlankFillGame lesson={lesson} onClear={nextScreen} />;
      case 3:
        return <TranslationPuzzleGame lesson={lesson} onClear={nextScreen} />;
      case 4:
        return (
          <Flex
            width="100%"
            flexDir="column"
            alignItems="center"
            bg="green.500"
            p={[2, 4]}
            gap={[2, 4]}
          >
            <Text
              fontSize={['large', 'xx-large']}
              color="white"
              textAlign="center"
            >
              Congrats, here is your first certificate!
            </Text>
            <Box h="100%" width="50%">
              <Certificate
                lessonTitle="First Lesson 🥳"
                completedDate={dayjs().utc().format('YYYY.MM.DD')}
              />
            </Box>
          </Flex>
        );
    }
  }, [lesson, screenStep]);

  let h = screenStep === 0 ? '30svh' : '90svh';
  h = screenStep === 4 ? 'fit-content' : h;

  return <Box h={h}>{screen}</Box>;
}

function DataLoaderGuide() {
  return (
    <Box bg="#ececec">
      <Container maxW="container.md" p={[4, 8, 16]}>
        <Card>
          <CardHeader>
            <Heading size="md">How To Restore Data</Heading>
            <Text pt="2" pb="2">
              You can find this feature on the profile page
            </Text>
            <DataLoader />
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Import
                </Heading>
                <Text pt="2" fontSize="sm">
                  Open the exported JSON file to replace the current data with
                  the file's contents.
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Export
                </Heading>
                <Text pt="2" fontSize="sm">
                  Save the JSON file to your device for data storage.
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Reset
                </Heading>
                <Text pt="2" fontSize="sm">
                  This action permanently deletes all current data. Please note
                  that it cannot be undone.
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

function ContributionGuide() {
  const listItems = [
    'Did you find any typos?',
    'Is there something wrong with the questions?',
    'Have you encountered any issues with the app?',
    'Do you have any ideas for improving the service?',
    'Just want to share something something?',
  ];

  return (
    <Container maxW="container.md" p={[4, 8, 16]}>
      <Flex flexDir="column" gap={[1, 2, 4]}>
        {listItems.map((item, idx) => (
          <Flex
            key={idx}
            columnGap={4}
            fontSize={[14, 18, 24]}
            alignItems="center"
          >
            <FaQuestion color="red" />
            {item}
          </Flex>
        ))}
      </Flex>
      <Flex flexDir="column" alignItems="center" pt={[2, 4, 8]} gap={[2, 4]}>
        <Text
          textAlign="center"
          fontSize={['small', 'large', 'x-large']}
          borderBottom="2px solid #ccc"
          pb={2}
        >
          Be part of our community and share your thoughts with us!
        </Text>
        <Link to={import.meta.env.VITE_GITHUB_REPO_URL} target="_blank">
          <Button
            size={['sm', 'md', 'lg']}
            leftIcon={<FaGithub />}
            colorScheme="teal"
            variant="solid"
          >
            Github Issues
          </Button>
        </Link>
      </Flex>
    </Container>
  );
}

export default HomePage;
