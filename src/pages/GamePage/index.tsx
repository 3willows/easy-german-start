import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import DefaultTemplate from '../../components/DefaultTemplate';
import TranslationPuzzleGame from '../../components/TranslationPuzzleGame';
import BlankFillGame from '../../components/BlankFillGame';
import MatchGame from '../../components/MatchGame';
import GetLessonFromParams from '../../components/GetLessonFromParams';
import { Lesson } from '../../types/lesson';
import useHistory from '../../hooks/useHistory';
import { useNavigate } from 'react-router-dom';

const GamePage = () => {
  const [stage, setStage] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(
    undefined
  );
  const [indices, setIndices] = useState<{
    section: number;
    lesson: number;
  }>({
    section: -1,
    lesson: -1,
  });
  const { addHistory } = useHistory();
  const navigate = useNavigate();

  const game = useMemo(() => {
    if (!currentLesson) return null;

    const nextStage = () => setStage((prevStage) => prevStage + 1);
    switch (stage) {
      case 0:
        return <MatchGame lesson={currentLesson} onClear={nextStage} />;
      case 1:
        return <BlankFillGame lesson={currentLesson} onClear={nextStage} />;
      case 2:
        return (
          <TranslationPuzzleGame lesson={currentLesson} onClear={nextStage} />
        );
      default:
        return null;
    }
  }, [currentLesson, stage]);

  // complete the lesson without playing for test purpos
  useEffect(() => {
    if (!currentLesson) return;
    addHistory({
      lessonTitle: currentLesson?.lessonTitle ?? 'Something went wrong',
      lessonDesc: currentLesson?.lessonDesc ?? 'Something went wrong',
      completedDate: dayjs.utc().toString(),
      sectionIndex: indices.section,
      lessonIndex: indices.lesson,
    });
    navigate(`/completion`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson]);

  // useEffect(() => {
  //   if (stage < 3) return;

  //   addHistory({
  //     lessonTitle: currentLesson?.lessonTitle ?? 'Something went wrong',
  //     lessonDesc: currentLesson?.lessonDesc ?? 'Something went wrong',
  //     completedDate: dayjs.utc().toString(),
  //     sectionIndex: indices.section,
  //     lessonIndex: indices.lesson,
  //   });
  //   navigate(`/completion`);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [stage]);

  return (
    <DefaultTemplate disablePadding bgGreen>
      <GetLessonFromParams
        onLoad={(lesson, sectionIndex, lessonIndex) => {
          setCurrentLesson(lesson);
          setIndices({ section: sectionIndex, lesson: lessonIndex });
        }}
      />
      {game}
    </DefaultTemplate>
  );
};

export default GamePage;
