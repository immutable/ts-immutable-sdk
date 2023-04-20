import { Router } from 'express';

import craftPost from './__mocks__/craftPost.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/crafting/swagger/index.html#/root/post_craft
 */
router.post('/crafting/craft', (req, res) => {
  const testCase = req.get('Test-Case');
  const testCaseCode = Number(req.get('Test-Case-Code'));

  switch (testCase) {
    case 'fail':
      res.status(testCaseCode).send({
        errors: [{ error: testCaseCode, name: 'test case error' }],
        message: 'test case error message',
      });
      break;

    default:
      res.status(200).send(craftPost);
      break;
  }
});

export default router;
