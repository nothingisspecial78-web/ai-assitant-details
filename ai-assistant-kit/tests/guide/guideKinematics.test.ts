import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAvatarPose } from '../../assets/3d/avatarKinematics.ts';

test('3D Avatar Kinematics: Privacy mode closes eyes completely on sensitive/password input', () => {
  const normalPose = computeAvatarPose({
    elapsed: 1.0,
    clickAgeSec: null,
    celebrateAgeSec: null,
    hovered: false,
    thinking: false,
    pointerX: 0.5,
    pointerY: 0.5,
    sensitive: false,
  });

  const sensitivePose = computeAvatarPose({
    elapsed: 1.0,
    clickAgeSec: null,
    celebrateAgeSec: null,
    hovered: false,
    thinking: false,
    pointerX: 0.5,
    pointerY: 0.5,
    sensitive: true,
  });

  assert.equal(normalPose.state, 'idle');
  assert.equal(sensitivePose.state, 'sensitive');
  assert.equal(sensitivePose.eyeScaleY, 0, 'Eye scale must be 0 (closed) in sensitive mode');
  assert.ok(sensitivePose.headRotY < -0.3, 'Head must turn away in sensitive mode');
});
