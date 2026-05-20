import questionMap from '@/data/question-map.json';

// 把用户的选择路径代码转成一段完整叙述
export function buildUserPath(answers: Record<string, string>): string {
  const parts: string[] = [];

  const add = (key: string, text: string) => {
    if (text) parts.push(text);
  };

  // 问题1
  if (answers.q1) {
    add('q1', questionMap.q1[answers.q1 as keyof typeof questionMap.q1]);
    if (answers.q1_secondary) {
      add('q1s', questionMap.q1_secondary[answers.q1_secondary as keyof typeof questionMap.q1_secondary]);
    }
  }

  // 问题2
  if (answers.q2) {
    add('q2', questionMap.q2[answers.q2 as keyof typeof questionMap.q2]);
    if (answers.q2_secondary) {
      add('q2s', questionMap.q2_secondary[answers.q2_secondary as keyof typeof questionMap.q2_secondary]);
    }
  }

  // 呼吸问题
  if (answers.q_breath) {
    add('breath', questionMap.q_breath[answers.q_breath as keyof typeof questionMap.q_breath]);
    if (answers.q_breath_secondary) {
      add('breaths', questionMap.q_breath_secondary[answers.q_breath_secondary as keyof typeof questionMap.q_breath_secondary]);
    }
  }

  // 问题3
  if (answers.q3) {
    add('q3', questionMap.q3[answers.q3 as keyof typeof questionMap.q3]);
    if (answers.q3_secondary) {
      add('q3s', questionMap.q3_secondary[answers.q3_secondary as keyof typeof questionMap.q3_secondary]);
    }
  }

  // 问题4
  if (answers.q4) {
    add('q4', questionMap.q4[answers.q4 as keyof typeof questionMap.q4]);
    if (answers.q4_secondary) {
      add('q4s', questionMap.q4_secondary[answers.q4_secondary as keyof typeof questionMap.q4_secondary]);
    }
  }

  // 问题5
  if (answers.q5) {
    add('q5', questionMap.q5[answers.q5 as keyof typeof questionMap.q5]);
    if (answers.q5_secondary) {
      add('q5s', questionMap.q5_secondary[answers.q5_secondary as keyof typeof questionMap.q5_secondary]);
    }
  }

  // 问题6 (新)
  if (answers.q6) {
    add('q6', questionMap.q6[answers.q6 as keyof typeof questionMap.q6]);
    if (answers.q6_secondary) {
      add('q6s', questionMap.q6_secondary[answers.q6_secondary as keyof typeof questionMap.q6_secondary]);
    }
  }

  return parts.join('。');
}