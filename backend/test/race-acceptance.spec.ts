import { describe, it, expect, beforeEach } from 'vitest';
import { RaceService } from '../src/modules/race/race.service';

describe('Live Race Acceptance Tests (Section 178)', () => {
  let raceService: RaceService;

  beforeEach(() => {
    raceService = new RaceService();
  });

  // Scenario 1: Player A enters empty room -> A triggers new race preparation
  it('Scenario 1: Player A entering empty room triggers countdown/preparation', () => {
    const { room, joinedDuringActive } = raceService.joinRoom('test-room-1', 'socket-a', {
      id: 'user-a',
      name: 'Player A',
      level: 10,
      skinId: 'classic-racer',
    });

    expect(room.participants.size).toBe(1);
    expect(joinedDuringActive).toBe(false);
    expect(room.state).toBe('COUNTDOWN');
    expect(room.countdownSeconds).toBe(3);
  });

  // Scenario 2: Player B enters during A's active race -> B does NOT reset or delay A's race, waits for next cycle
  it("Scenario 2: Player B joining during active race does NOT reset or delay A's race", () => {
    // Setup active room with player A
    const { room } = raceService.joinRoom('test-room-2', 'socket-a', {
      id: 'user-a',
      name: 'Player A',
      level: 10,
      skinId: 'classic-racer',
    });
    room.state = 'ACTIVE';

    // Player B joins while A is racing
    const { room: updatedRoom, joinedDuringActive } = raceService.joinRoom('test-room-2', 'socket-b', {
      id: 'user-b',
      name: 'Player B',
      level: 15,
      skinId: 'cyber-phantom',
    });

    expect(updatedRoom.state).toBe('ACTIVE'); // Race state remains ACTIVE, not reset!
    expect(joinedDuringActive).toBe(true);
    expect(updatedRoom.participants.get('user-b')?.joinedDuringActive).toBe(true);
  });

  // Scenario 3: A and B are active typers, C is connected but not typing -> C does not block race completion
  it('Scenario 3: Non-typing user C does not block race completion for A and B', () => {
    raceService.joinRoom('test-room-3', 'socket-a', { id: 'user-a', name: 'A', level: 10, skinId: 'c1' });
    raceService.joinRoom('test-room-3', 'socket-b', { id: 'user-b', name: 'B', level: 12, skinId: 'c2' });
    raceService.joinRoom('test-room-3', 'socket-c', { id: 'user-c', name: 'C', level: 5, skinId: 'c3' });

    const room = raceService.getRoom('test-room-3')!;
    room.state = 'ACTIVE';

    // A and B type and complete 100%
    raceService.updateProgress('test-room-3', 'user-a', 100, 60, 99, 0);
    // User C is inactive and never types, let's mark inactive
    const pC = room.participants.get('user-c')!;
    pC.isActive = false;
    pC.isAbandoned = true;

    // B finishes
    raceService.updateProgress('test-room-3', 'user-b', 100, 55, 98, 1);

    expect(room.state).toBe('RESULT'); // Room reached RESULT without waiting for C!
  });

  // Scenario 4: B stops typing -> Inactivity check marks abandoned after grace period
  it('Scenario 4: Inactive player beyond grace period is marked abandoned and does not block room', () => {
    raceService.joinRoom('test-room-4', 'socket-a', { id: 'user-a', name: 'A', level: 10, skinId: 'c1' });
    raceService.joinRoom('test-room-4', 'socket-b', { id: 'user-b', name: 'B', level: 10, skinId: 'c2' });

    const room = raceService.getRoom('test-room-4')!;
    room.state = 'ACTIVE';

    // Simulate player B stopping typing 9 seconds ago
    const pB = room.participants.get('user-b')!;
    pB.lastStrokeTime = Date.now() - 9000;

    const { abandonedUsers } = raceService.checkInactivity('test-room-4');
    expect(abandonedUsers).toContain('user-b');
    expect(pB.isAbandoned).toBe(true);
    expect(pB.isActive).toBe(false);
  });

  // Scenario 6: A and B are active, both request Change Text -> new text cycle begins
  it('Scenario 6: Unanimous change text vote triggers new countdown and resets race cycle', () => {
    raceService.joinRoom('test-room-6', 'socket-a', { id: 'user-a', name: 'A', level: 10, skinId: 'c1' });
    raceService.joinRoom('test-room-6', 'socket-b', { id: 'user-b', name: 'B', level: 10, skinId: 'c2' });

    const room = raceService.getRoom('test-room-6')!;
    room.state = 'ACTIVE';

    // Only player A votes -> not unanimous yet
    const vote1 = raceService.voteChangeText('test-room-6', 'user-a');
    expect(vote1).toBe(false);
    expect(room.state).toBe('ACTIVE');

    // Player B votes -> unanimous!
    const vote2 = raceService.voteChangeText('test-room-6', 'user-b');
    expect(vote2).toBe(true);
    expect(room.state).toBe('COUNTDOWN');
    expect(room.countdownSeconds).toBe(3);
  });

  // Scenario 8: User exits room safely without corrupting race state
  it('Scenario 8: User exiting updates state safely without corrupting race state', () => {
    raceService.joinRoom('test-room-8', 'socket-a', { id: 'user-a', name: 'A', level: 10, skinId: 'c1' });
    raceService.joinRoom('test-room-8', 'socket-b', { id: 'user-b', name: 'B', level: 10, skinId: 'c2' });

    raceService.leaveRoom('test-room-8', 'user-a');
    const room = raceService.getRoom('test-room-8')!;
    expect(room.participants.has('user-a')).toBe(false);
    expect(room.participants.has('user-b')).toBe(true);
  });
});
