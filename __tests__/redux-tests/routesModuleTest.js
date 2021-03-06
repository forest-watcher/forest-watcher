// @flow
import 'react-native';
import { migrateRouteStateFromV1ToV2 } from '../../app/migrate';

function getMockUUID() {
  return `487a2312-7600-4c9f-a7ff-d6ad69a721a0`;
}

describe('redux-modules/routes', () => {
  describe('func migrateRouteStateFromV1ToV2', () => {
    const mockArea1 = {
      name: 'testArea1',
      id: 'testAreaId1',
      application: 'applicationMock', // used to test that all fields are included in payload
      geostore: { id: 'testGeostoreId1' }
    };

    const mockV1Route1 = {
      id: 'testRouteId1',
      areaId: 'testAreaId1',
      name: 'routeNameMock'
    };

    const mockV1Route2 = {
      id: 'testRouteId2',
      areaId: 'testAreaId1',
      name: 'routeNameMock'
    };

    const mockV2Route = {
      id: '487a2312-7600-4c9f-a7ff-d6ad69a721a0',
      areaId: 'testAreaId1',
      name: 'routeNameMock',
      geostoreId: 'testGeostoreId1'
    };

    const mockV1RouteStateSingleRoute = {
      activeRoute: undefined,
      previousRoutes: [mockV1Route1]
    };

    const mockV1RouteStateActiveRoute = {
      activeRoute: {
        areaId: 'testAreaId1',
        id: '1234567890',
        startDate: 1234567890
      },
      previousRoutes: []
    };

    const mockV1RouteStateMultipleRoutes = {
      activeRoute: undefined,
      previousRoutes: [mockV1Route1, mockV1Route2]
    };

    const mockV1RouteStateMultipleRoutesForDifferentAreas = {
      activeRoute: undefined,
      previousRoutes: [mockV1Route1, { ...mockV1Route2, areaId: 'testAreaId2' }]
    };

    it('returns fresh state when provided no params', () => {
      expect(migrateRouteStateFromV1ToV2()).toMatchSnapshot();
    });

    it('returns fresh state when provided null params', () => {
      expect(migrateRouteStateFromV1ToV2(null, null)).toMatchSnapshot();
    });

    it('returns fresh state when provided undefined params', () => {
      expect(migrateRouteStateFromV1ToV2(undefined)).toMatchSnapshot();
    });

    it('returns fresh state when provided invalid params', () => {
      expect(migrateRouteStateFromV1ToV2(mockV1Route1, mockArea1, getMockUUID)).toMatchSnapshot();
    });

    it('returns updated state when provided route state with no routes', () => {
      expect(
        migrateRouteStateFromV1ToV2(
          { ...mockV1RouteStateSingleRoute, previousRoutes: [] },
          [mockArea1],
          getMockUUID
        )
      ).toMatchSnapshot();
    });

    it('returns existing state when provided route state already using v2 structure', () => {
      expect(
        migrateRouteStateFromV1ToV2(
          { ...mockV1RouteStateSingleRoute, previousRoutes: [mockV2Route], routeStructureVersion: 'v2' },
          [mockArea1],
          getMockUUID
        )
      ).toMatchSnapshot();
    });

    describe('with active route', () => {
      it('returns updated state when provided null areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateActiveRoute, null, getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided empty areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateActiveRoute, [], getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided area with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateActiveRoute,
            [{ ...mockArea1, id: 'nonMatchingID' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateActiveRoute,
            [{ ...mockArea1, id: 'nonMatchingID1' }, { ...mockArea1, id: 'nonMatchingID2' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided area with matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(mockV1RouteStateActiveRoute, [mockArea1], getMockUUID)
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas where one area matches', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateActiveRoute,
            [mockArea1, { ...mockArea1, id: 'nonMatchingId' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });
    });

    describe('with one route', () => {
      it('returns updated state when provided null areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateSingleRoute, null, getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided empty areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateSingleRoute, [], getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided area with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateSingleRoute,
            [{ ...mockArea1, id: 'nonMatchingID' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateSingleRoute,
            [{ ...mockArea1, id: 'nonMatchingID1' }, { ...mockArea1, id: 'nonMatchingID2' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided area with matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(mockV1RouteStateSingleRoute, [mockArea1], getMockUUID)
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas where one area matches', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateSingleRoute,
            [mockArea1, { ...mockArea1, id: 'nonMatchingId' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });
    });

    describe('with two routes', () => {
      it('returns updated state when provided null areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateMultipleRoutes, null, getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided empty areas', () => {
        expect(migrateRouteStateFromV1ToV2(mockV1RouteStateMultipleRoutes, [], getMockUUID)).toMatchSnapshot();
      });

      it('returns updated state when provided area with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutes,
            [{ ...mockArea1, id: 'nonMatchingID' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas with non-matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutes,
            [{ ...mockArea1, id: 'nonMatchingID1' }, { ...mockArea1, id: 'nonMatchingID2' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided area with matching ID', () => {
        expect(
          migrateRouteStateFromV1ToV2(mockV1RouteStateMultipleRoutes, [mockArea1], getMockUUID)
        ).toMatchSnapshot();
      });

      it('returns updated state when provided areas where one area matches', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutes,
            [mockArea1, { ...mockArea1, id: 'nonMatchingId' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided routes for different areas & neither match', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutesForDifferentAreas,
            [{ ...mockArea1, id: 'nonMatchingId1' }, { ...mockArea1, id: 'nonMatchingId2' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided routes for different areas & only one matches', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutesForDifferentAreas,
            [mockArea1, { ...mockArea1, id: 'nonMatchingId' }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });

      it('returns updated state when provided routes for different areas & both match', () => {
        expect(
          migrateRouteStateFromV1ToV2(
            mockV1RouteStateMultipleRoutesForDifferentAreas,
            [mockArea1, { ...mockArea1, id: 'testAreaId2', geostore: { id: 'testGeostoreId2' } }],
            getMockUUID
          )
        ).toMatchSnapshot();
      });
    });
  });
});
