export default {
  viirs: {
    endpoint: 'https://wri-01.carto.com/api/v1/map/',
    layers: [{
      user_name: 'wri-01',
      type: 'cartodb',
      options: {
        sql: 'SELECT *, CURRENT_DATE-acq_date as date FROM vnp14imgtdl_nrt_global_7d order by date desc',
        cartocss_version: '2.3.0',
        cartocss: `#vnp14imgtdl_nrt_global_7d {
          marker-fill: transparent;
          marker-width: 1;
          marker-line-width: 0;
          marker-line-opacity: 1;
          marker-fill-opacity: 1;
          marker-placement: point;
          marker-allow-overlap: true;
        }
        #vnp14imgtdl_nrt_global_7d[date=0]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=1]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=2]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=3]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=4]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=5]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=6]{marker-fill: rgba(244,66,66,1);}
        #vnp14imgtdl_nrt_global_7d[date=7]{marker-fill: rgba(244,66,66,1);}`
      }
    }]
  }
};
