// 진료 종류와 검사 목록. 병원이 실제로 하는 검사에 맞게 이 파일만 고치면 화면에 반영된다.
// (PRD: 진료 종류·검사 목록은 아직 미정이라 흔한 이름으로 채워 둔 임시 목록이다.)
window.EXAM_GROUPS = [
  { id: 'checkup', name: '건강검진', exams: ['기본 건강검진', '종합 건강검진'] },
  { id: 'imaging', name: '영상검사', exams: ['X-ray', '초음파', 'CT', 'MRI'] },
  { id: 'endoscopy', name: '내시경', exams: ['위내시경', '대장내시경'] },
  { id: 'lab', name: '혈액·소변검사', exams: ['혈액검사', '소변검사'] },
  { id: 'unsure', name: '잘 모르겠어요', exams: ['어떤 검사가 필요한지 상담'] }
];
