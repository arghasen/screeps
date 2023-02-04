import {getBuilderBody, getHaulerBody, getSpawnCost} from './creepBuilder'
import stubConstants from '../../../tests/stub/constants';

describe("Creep Builder", () => {
    beforeAll(() => {
        stubConstants();
      });

    it("should be able to calculate the cost", () => {
        let body =[WORK];
        expect(getSpawnCost(body)).toBe(100)
    });
    
    it("should create a hauler body", () => {
        const hauler1 = getHaulerBody(300);
        expect(getSpawnCost(hauler1)).toBe(300);
        const hauler2 = getHaulerBody(400);
        expect(getSpawnCost(hauler2)).toBe(400);
        const hauler3 = getHaulerBody(500);
        expect(getSpawnCost(hauler3)).toBe(500);
        const hauler4 = getHaulerBody(800);
        expect(getSpawnCost(hauler4)).toBe(800);
        const hauler5 = getHaulerBody(1000);
        expect(getSpawnCost(hauler5)).toBe(800);
    })
    it("should create a builder body", () => {
        const builder1 = getBuilderBody(300);
        expect(getSpawnCost(builder1)).toBe(200);
        const builder2 = getBuilderBody(400);
        expect(getSpawnCost(builder2)).toBe(400);
        const builder3 = getBuilderBody(500);
        expect(getSpawnCost(builder3)).toBe(400);
        const builder4 = getBuilderBody(600);
        expect(getSpawnCost(builder4)).toBe(600);
        const builder5 = getBuilderBody(1000);
        expect(getSpawnCost(builder5)).toBe(600);
        const builder6 = getBuilderBody(1100);
        expect(getSpawnCost(builder6)).toBe(1100);
        const builder7 = getBuilderBody(1200);
        expect(getSpawnCost(builder7)).toBe(1100);
    })
});

