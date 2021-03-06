import request from "supertest";
import * as london1888Dependency from "../london1888";
import app from "../app";
import {BASIC_CITIZEN, CLOSEST_CITIZEN, SAME_CLOSEST_CITIZEN, VICTIM} from "../mocks/citizen.mock";

const mockGetAllCitizensAsync = jest.fn()
const mockGetVictimAsync = jest.fn()
const mockGetClosestCitizensFromVictim = jest.fn()

jest.mock('../dal.js', () => {
    return jest.fn().mockImplementation(() => ({
        getAllCitizenAsync: mockGetAllCitizensAsync,
        getVictimAsync: mockGetVictimAsync,
    }))
})

describe('Get Jack action', () => {
    it("No victim", async () => {
        mockGetVictimAsync.mockReturnValue(undefined)

        const getClosestCitizensFromVictim = jest.spyOn(
            london1888Dependency.getLondon1888(),
            'getClosestCitizensFromVictim'
        );

        const res = await request(app).get(`/getJack`);

        expect(res.status).toBe(404)
        expect(mockGetVictimAsync).toHaveBeenCalledTimes(1)
        expect(mockGetAllCitizensAsync).not.toHaveBeenCalled()
        expect(getClosestCitizensFromVictim).not.toHaveBeenCalled()
    })

    it('No citizens', async () => {
        mockGetVictimAsync.mockReturnValue(VICTIM);
        mockGetAllCitizensAsync.mockReturnValue([]);

        const getClosestCitizensFromVictim = jest.spyOn(
            london1888Dependency.getLondon1888(),
            'getClosestCitizensFromVictim'
        );

        const res = await request(app).get(`/getJack`);

        expect(res.status).toBe(404)
        expect(mockGetAllCitizensAsync).toHaveBeenCalledTimes(1)
        expect(getClosestCitizensFromVictim).not.toHaveBeenCalled()
    })

    it("Conflict with closest citizens", async () => {
        mockGetAllCitizensAsync.mockReturnValue([CLOSEST_CITIZEN, SAME_CLOSEST_CITIZEN, BASIC_CITIZEN]);
        mockGetVictimAsync.mockReturnValue(VICTIM);
        mockGetClosestCitizensFromVictim.mockReturnValue([CLOSEST_CITIZEN, SAME_CLOSEST_CITIZEN]);

        const getClosestCitizensFromVictim = jest.spyOn(
            london1888Dependency.getLondon1888(),
            'getClosestCitizensFromVictim'
        );

        const res = await request(app).get(`/getJack`);

        expect(res.status).toBe(409)
        expect(getClosestCitizensFromVictim).toHaveBeenCalledTimes(1)
    })

    it("Find the closest citizen of the victim", async () => {
        mockGetAllCitizensAsync.mockReturnValue([CLOSEST_CITIZEN, BASIC_CITIZEN]);
        mockGetVictimAsync.mockReturnValue(VICTIM);
        mockGetClosestCitizensFromVictim.mockReturnValue([CLOSEST_CITIZEN]);

        const res = await request(app).get(`/getJack`);

        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual(CLOSEST_CITIZEN)
    })
})
