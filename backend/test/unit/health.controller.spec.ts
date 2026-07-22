import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from '../../src/health.controller';

describe('HealthController', () => {
  it('reports liveness without external dependencies', () => {
    const controller = new HealthController({} as any);
    expect(controller.live().status).toBe('ok');
  });

  it('fails readiness when the database cannot be reached', async () => {
    const controller = new HealthController({ $queryRaw: jest.fn().mockRejectedValue(new Error()) } as any);
    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
