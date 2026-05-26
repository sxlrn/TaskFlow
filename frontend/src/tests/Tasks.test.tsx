import { describe, it, expect } from 'vitest';
import { getNextStatus, getNextLabel } from '../pages/Tasks';
import type { Task } from '../types';

describe('Task Workflow Transitions', () => {
  const baseTask: Task = {
    id: 1,
    title: 'Тестова задача',
    project_id: 1,
    reporter_id: 1,
    priority: 'medium',
    status: 'todo',
    type: 'standard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe('getNextStatus', () => {
    it('should transition from backlog to todo', () => {
      const task: Task = { ...baseTask, status: 'backlog' };
      expect(getNextStatus(task)).toBe('todo');
    });

    it('should transition a standard task from todo directly to in_progress (skipping research)', () => {
      const task: Task = { ...baseTask, status: 'todo', type: 'standard' };
      expect(getNextStatus(task)).toBe('in_progress');
    });

    it('should transition a research task from todo to research status first', () => {
      const task: Task = { ...baseTask, status: 'todo', type: 'research' };
      expect(getNextStatus(task)).toBe('research');
    });

    it('should transition a research task from research to in_progress', () => {
      const task: Task = { ...baseTask, status: 'research', type: 'research' };
      expect(getNextStatus(task)).toBe('in_progress');
    });

    it('should transition a standard task from in_progress to code_review', () => {
      const task: Task = { ...baseTask, status: 'in_progress', type: 'standard' };
      expect(getNextStatus(task)).toBe('code_review');
    });

    it('should transition a research task from in_progress to review directly', () => {
      const task: Task = { ...baseTask, status: 'in_progress', type: 'research' };
      expect(getNextStatus(task)).toBe('review');
    });

    it('should transition tasks from code_review to review', () => {
      const task: Task = { ...baseTask, status: 'code_review' };
      expect(getNextStatus(task)).toBe('review');
    });


    it('should transition tasks from review to done', () => {
      const task: Task = { ...baseTask, status: 'review' };
      expect(getNextStatus(task)).toBe('done');
    });

    it('should return null for done status', () => {
      const task: Task = { ...baseTask, status: 'done' };
      expect(getNextStatus(task)).toBeNull();
    });
  });

  describe('getNextLabel', () => {
    it('should return correct label for standard task next status', () => {
      const task: Task = { ...baseTask, status: 'todo', type: 'standard' };
      expect(getNextLabel(task)).toBe('→ В роботі');
    });

    it('should return correct label for research task next status', () => {
      const task: Task = { ...baseTask, status: 'todo', type: 'research' };
      expect(getNextLabel(task)).toBe('→ Дослідження');
    });

    it('should return empty string when there is no next status', () => {
      const task: Task = { ...baseTask, status: 'done' };
      expect(getNextLabel(task)).toBe('');
    });
  });
});
