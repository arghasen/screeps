import myRooms from './'
import stubGame from '../../../tests/stub/game'
import stubRoom from '../../../tests/stub/room'

describe('My Rooms', () => {
  beforeAll(() => {
    stubGame({
      rooms: [
        stubRoom('W1N1', {
          controller: {
            exists: true,
            my: true
          }
        }),
        stubRoom('W2N1', {
          controller: {
            exists: true,
            my: false
          }
        }),
        stubRoom('W2N2', {
          controller: {
            exists: false,
            my: false
          }
        })
      ]
    })
  })

  it('should return an array of rooms.', () => {
    expect(myRooms().length).toBe(1)
  })
})