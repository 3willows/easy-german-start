import { Box, Button, Container, Flex, Image, Text } from '@chakra-ui/react';
import DefaultTemplate from '../../components/DefaultTemplate';
import FirstImage from './res/a.webp';
import SecondImage from './res/b.webp';
import ThirdImage from './res/c.webp';
import FourthImage from './res/d.webp';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Lesson } from '../../types/lesson';
import MatchGame from '../../components/MatchGame';
import IntroCard from '../../components/IntroCard';
import { getImgUrlWithBaseUrl } from '../../libs/const';
import BlankFillGame from '../../components/BlankFillGame';
import TranslationPuzzleGame from '../../components/TranslationPuzzleGame';
import Certificate from '../../components/Certiicate';
import dayjs from 'dayjs';

function HomePage() {
  return (
    <DefaultTemplate disablePadding>
      <EntrySection />
      <IntroSection />
      <DemoSection />
      <Padding />
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
  const [imgIndices, setImgIndices] = useState([0, 1, 2, 3]);
  const [animImgIndex, setAnimImgIndex] = useState(-1);
  const tmRef = useRef<{ tmChangeImg: NodeJS.Timeout | undefined }>({
    tmChangeImg: undefined,
  });
  const prevRandomIdx = useRef<number>(-1); // prevent changing the same image that changed right before.

  const handleAnimEnd = () => setAnimImgIndex(-1);

  const changeImg = () => {
    tmRef.current.tmChangeImg = setTimeout(
      () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log(animFuncQueue);
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

  return <Box h={screenStep === 0 ? '30svh' : '90svh'}>{screen}</Box>;
}

function Padding() {
  return <Box bg="white" minH="100svh"></Box>;
}

export default HomePage;
