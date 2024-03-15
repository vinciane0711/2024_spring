<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
// @ts-ignore
import houseData from '@/assets/house_viewing.csv'
// @ts-ignore
import schoolData from '@/assets/school.csv'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
// import 'leaflet.markercluster/src'

interface IHouse {
  name: string
  info: {
    date: Date
    place: string
    address: string
    coord: [number, number]
    price: number
    per_price: number
    age: number
    link: string
  }
  detail: {
    rate: number
    layout: { room: number; living: number; bath: number }
    square: {
      total: number
      subarea: number
      main: number
      public: number
      parking: number
    }
    floor: { total: number; cnt: number }
    management: number
  }
}
const data: Map<string, IHouse> = new Map()
for (const e of houseData) {
  data.set(e.index, {
    name: e.name,
    info: {
      date: new Date(e.date),
      place: e.place,
      address: e.address,
      coord: [+e.coord_lat, +e.coord_lon],
      price: +e.price,
      per_price: +e.per_price,
      age: +e.age,
      link: e.link,
    },
    detail: {
      rate: +e.public_rate,
      layout: { room: +e.layout_r, living: +e.layout_l, bath: +e.layout_b },
      square: {
        total: +e.square_total,
        main: +e.square_main,
        subarea: +e.square_subarea,
        public: +e.square_public,
        parking: +e.square_parking,
      },
      floor: { total: +e.floor_total, cnt: +e.floor_cnt },
      management: +e.management,
    },
  })
}

const school = L.layerGroup()

// console.log(schoolData)

// const places = ['林口', '龜山', '八德', '桃園', '蘆竹']
// const place = ref(places[2])
const map = ref<L.Map>()
const selectedId = ref('36')
const cntHouse = computed(() => data.get(selectedId.value))

const color = (n: number) => {
  switch (true) {
    case n <= 30:
      return 'bg-blue-500'
    case n <= 35:
      return 'bg-green-500'
    case n >= 35:
      return 'bg-red-500'
  }
}

const iconMarker = (name: string, price: number, id: string) => {
  return L.divIcon({
    className: '',
    html: `<div class='customMarker' data-uid='${id}'>
            <div>
              <span class='${color(price)}'>${Math.round(price)}</span>
              <span>${name}</span>
            </div>
          </div>`,
  })
}

// const baseMap = L.tileLayer(
//   'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
//   {
//     attribution:
//       '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France',
//   }
// )

const noLabelMap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  {
    attribution: '©OpenStreetMap, ©CartoDB',
  }
)

const baseMaps = {
  // base: baseMap,
  clear: noLabelMap,
}

const overlayMaps = {
  school: school,
}

const initMap = () => {
  map.value = L.map('mapContainer', {
    center: [24.9307336, 121.2894254],
    zoom: 15,
    zoomControl: false,
    layers: [noLabelMap],
    // zoomAnimation: true,
    // fadeAnimation: true,
    // markerZoomAnimation: true,
  }).setMinZoom(12)

  L.control.layers(baseMaps, overlayMaps).addTo(map.value)

  // const pane = map.value.createPane('house')
  // pane.style.zIndex = '800'

  // map.value.addLayer(markers)
}

const addMarkers = () => {
  data.forEach((h, i) => {
    L.marker(h.info.coord, {
      icon: iconMarker(h.name, h.info.per_price, i),
      riseOnHover: true,
    })
      .on('click', () => {
        selectedId.value = i
      })
      .addTo(map.value!)
  })

  const _sData = schoolData.filter(
    (s: any) => s.dist === '八德區' || s.dist === '龜山區'
  )

  _sData.forEach((s: any) => {
    L.marker([s.Latitude, s.Longitude], { riseOnHover: true })
      .bindTooltip(s.name_short)
      .addTo(school)
  })
}

onMounted(() => {
  initMap()
  addMarkers()
})

watch(selectedId, () => {
  const latlng = data.get(selectedId.value)!.info.coord
  map.value!.setView(latlng)
})
</script>

<template>
  <div id="mapContainer" class="grow" />
  <div class="md:w-[300px] bg-white md:border-l border-t border-gray-300 p-4">
    <div class="flex text-sm gap-2 items-center pb-2">
      <select
        class="border border-gray-300 rounded-md px-1 py-2"
        v-model="selectedId"
        name=""
        id=""
      >
        <option v-for="h in data" :value="h[0]">
          {{ h[1].name }}
        </option>
      </select>
    </div>
    <div v-if="cntHouse">
      <div>
        <div class="flex items-center border-b border-gray-300 pb-2">
          <h2 class="text-xl font-bold">
            {{ cntHouse.name }}
          </h2>
          <div class="ml-auto">
            {{ cntHouse.info.price.toLocaleString() }} 萬
          </div>
        </div>

        <div class="text-sm space-y-2 py-2">
          <p>
            <span class="text-xs py-1 px-2 rounded-md bg-gray-200 mr-1">
              {{ cntHouse.info.place }}
            </span>
            {{ cntHouse.info.address }}
          </p>
          <p>
            {{ cntHouse.info.per_price }} 萬/坪 {{ cntHouse.info.age }} 年
            {{ cntHouse.detail.floor.cnt }}/{{ cntHouse.detail.floor.total }}
          </p>

          <div>
            <p>
              {{ cntHouse.detail.layout.room }} 房
              {{ cntHouse.detail.layout.living }} 廳
              {{ cntHouse.detail.layout.bath }} 衛 1 陽台
            </p>
          </div>

          <div class="grid grid-cols-2">
            <span>坪數</span> <span>{{ cntHouse.detail.square.total }}</span>
            <span>主建</span> <span>{{ cntHouse.detail.square.main }}</span>
            <span>附屬</span>
            <span>{{ cntHouse.detail.square.subarea }}</span>
            <span>車位</span>
            <span>{{ cntHouse.detail.square.parking }}</span>
            <span>共用</span>
            <span
              >{{ cntHouse.detail.square.public }} ({{
                Math.round(cntHouse.detail.rate * 100)
              }}%)</span
            >
          </div>
        </div>
      </div>
      <div></div>
      <!-- <div>
          <p>{{ cntHouse }}</p>
        </div> -->
    </div>
  </div>
</template>
