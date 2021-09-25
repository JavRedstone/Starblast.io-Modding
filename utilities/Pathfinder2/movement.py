import pyautogui
import time

def testtime(centerloc):
    middlex=centerloc[0]
    middley=centerloc[1]+centerloc[1]/16
    pyautogui.moveTo(middlex,middley-200)
    pyautogui.keyDown('up')
    time.sleep(0.12)
    pyautogui.keyUp('up')

def move(movepatt,centerloc,testtimewait,testtimego):
    middlex=centerloc[0]
    middley=centerloc[1]+centerloc[1]/16
    dir=movepatt[i]
    if dir == 'U':
        pyautogui.moveTo(middlex,middley-200)
    elif dir == 'D':
        pyautogui.moveTo(middlex,middley+200)
    elif dir == 'R':
        pyautogui.moveTo(middlex+200,middley)
    elif dir == 'L':
        pyautogui.moveTo(middlex-200,middley)
    time.sleep(0.5)
    pyautogui.keyDown('up')
    time.sleep(testtimego)
    pyautogui.keyUp('up')
    time.sleep(testtimewait)