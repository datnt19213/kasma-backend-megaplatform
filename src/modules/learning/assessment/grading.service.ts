import { Injectable } from '@nestjs/common';
import { LearningQuestion, QuestionType } from '@/entities/mongo/learning-question.mongo-entity';

@Injectable()
export class GradingService {
  async autoGrade(questions: LearningQuestion[], studentAnswers: any) {
    let totalScore = 0;
    const gradedResults: any[] = [];

    for (const question of questions) {
      const studentAnswer = studentAnswers[question.id.toString()];
      let isCorrect = false;

      if (question.type === QuestionType.MCQ || question.type === QuestionType.TRUE_FALSE) {
        isCorrect = studentAnswer === question.answer_key;
      } else if (question.type === QuestionType.MATCHING) {
        // Simple equality for JSON matching keys
        isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(question.answer_key);
      }

      if (isCorrect) totalScore++;
      
      gradedResults.push({
        question_id: question.id,
        is_correct: isCorrect,
        student_answer: studentAnswer,
        correct_answer: question.answer_key,
      });
    }

    const percentage = questions.length > 0 ? (totalScore / questions.length) * 100 : 0;

    return {
      score: percentage,
      results: gradedResults,
    };
  }
}
