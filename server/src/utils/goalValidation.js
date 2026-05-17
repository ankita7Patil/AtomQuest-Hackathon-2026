export function validateGoalPlan(goals) {
  if (goals.length > 8) return "A goal plan can contain a maximum of 8 goals.";
  if (goals.some((goal) => Number(goal.weightage) < 10)) return "Each goal must have at least 10% weightage.";
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  if (total !== 100) return `Total weightage must be exactly 100%. Current total is ${total}%.`;
  return null;
}

export function calculateProgress(goals) {
  const approvedGoals = goals.filter((goal) => goal.approvalStatus === "Approved");
  if (!approvedGoals.length) return 0;
  return Math.round(approvedGoals.reduce((sum, goal) => sum + (Number(goal.actual || 0) * Number(goal.weightage || 0)) / 100, 0));
}
