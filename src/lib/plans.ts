export type AccountType = 'FREE' | 'PROFESSIONAL';

export const FREE_PLAN_APPLICATION_LIMIT = 3;

export function canCreateApplication(
  accountType: AccountType | null | undefined,
  currentCount: number
): boolean {
  if (!accountType || accountType === 'PROFESSIONAL') return true;
  return currentCount < FREE_PLAN_APPLICATION_LIMIT;
}