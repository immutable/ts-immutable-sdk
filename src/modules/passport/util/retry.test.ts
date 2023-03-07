import { RetryOption, retryWithDelay } from './retry';

describe('retryWithDelay', () => {
    it('retryWithDelay should retry with default 5 times', async () => {
            const mockFunc = jest.fn().mockRejectedValue("error")

            await expect(retryWithDelay(mockFunc))
                .rejects
                .toThrow('Retry failed');

            expect(mockFunc).toHaveBeenCalledTimes(6)
        }
        , 15000)

    it('retryWithDelay should not retry when function call resolved', async () => {
            const mockFunc = jest.fn().mockReturnValue("success")

            await retryWithDelay(mockFunc)

            expect(mockFunc).toHaveBeenCalledTimes(1)
        }
    )

    it('retryWithDelay should  retry with custom option', async () => {
            const mockFunc = jest.fn().mockRejectedValue("error")
            const option: RetryOption = {
                retries: 2,
                interval: 100,
                finalErr: new Error("custom")
            }

            await expect(retryWithDelay(mockFunc, option))
                .rejects
                .toThrow('custom');

            expect(mockFunc).toHaveBeenCalledTimes(3)
        }
    )
},)
