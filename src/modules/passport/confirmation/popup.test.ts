/*
 * @jest-environment jsdom
 */
import { openPopupCenter, PopUpProps } from './popup';

describe('openPopupCenter', () => {
  let windowSpy: jest.SpyInstance;
  const mockPopup = {
    focus: jest.fn(),
    screen: {},
  };
  const mockWindow = {
    screenLeft: 100,
    screenTop: 200,
    innerWidth: 1200,
    innerHeight: 800,
    screen: {
      availWidth: 1920,
      height: 1080,
    },
    open: jest.fn().mockReturnValue(mockPopup),
  } as unknown as Window;

  beforeEach(() => {
    jest.clearAllMocks();
    windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => mockWindow);
  });

  it('should open a new window with correct dimensions', () => {
    const props: PopUpProps = {
      url: 'https://www.example.com',
      title: 'Example Popup',
      width: 800,
      height: 600,
    };

    const result = openPopupCenter(props);

    expect(result).toEqual(mockPopup);
    expect(mockWindow.open).toHaveBeenCalledWith(
      'https://www.example.com',
      'Example Popup',
      expect.any(String),
    );
    expect(mockPopup.focus).toHaveBeenCalledTimes(1);
    const screenArgs = (mockWindow.open as jest.Mock).mock.calls[0][2];
    expect(screenArgs.includes('width=1280')).toBeTruthy();
    expect(screenArgs.includes('height=960')).toBeTruthy();
    expect(screenArgs.includes('left=420')).toBeTruthy();
    expect(screenArgs.includes('top=360')).toBeTruthy();
  });

  it('should throw an error if the new window fails to open', () => {
    (mockWindow.open as jest.Mock).mockImplementationOnce(() => null);

    expect(() => openPopupCenter({
      url: 'https://www.example.com',
      title: 'Example Popup',
      width: 800,
      height: 600,
    })).toThrow('Failed to open confirmation screen');
  });
});
