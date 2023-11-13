<script setup lang="ts">
const { data } = await useFetch('/api/auth/me')
const DOB = ref(data.value?.dateOfBirth)
const formattedDOB = DOB.value?.split('T')[0]
const isExpanded1 = ref(false)
const isExpanded2 = ref(false)
const showPopup = ref(false)
const currentEvent = ref(null)

const togglePresentUpcoming = () => {
  isExpanded1.value = !isExpanded1.value
}

const togglePast = () => {
  isExpanded2.value = !isExpanded2.value
}

const openPopup = (event: any) => {
  currentEvent.value = event
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
}

function displayDate(dateTime: string) {
  const d = new Date(dateTime)
  const year = d.getUTCFullYear()
  const month = ('0' + (d.getUTCMonth() + 1)).slice(-2)
  const day = ('0' + d.getUTCDate()).slice(-2)

  let hours = d.getUTCHours()
  const minutes = ('0' + d.getUTCMinutes()).slice(-2)
  const ampm = hours >= 12 ? 'pm' : 'am'

  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'

  return `${year}-${month}-${day} @ ${hours}:${minutes} ${ampm}`
}
</script>

<template>
  <div id="WholePage" class="min-h-screen flex">
    <nav
      id="AccountInfo"
      class="shadow-sm w-2/5 p-2 flex-none bg-[#EEE] border-2 border-teal-200 border-t-gray-200 border-r-gray-200 justify-center lg:w-1/4"
    >
      <div id="OsteoLogoFiller" class="">
        <OsteoLogo />
      </div>

      <div id="UserInfo" class="p-3 my-2 bg-[#FFF] rounded-sm">
        <p id="MyHours" class="text-gray-700 text-xl font-['Work Sans']">
          Total Hours: {{ data?.numHours }}
        </p>
        <br />
        <p id="MyName" class="text-gray-700 text-large font-['Work Sans']">
          Name: {{ data?.name }}
        </p>
        <p id="MyEmail" class="text-gray-700 text-large font-['Work Sans']">
          Email: {{ data?.email }}
        </p>
        <p id="MyBirthday" class="text-gray-700 text-large font-['Work Sans']">
          <span class="text-gray-700">Birthday </span>
          <span class="text-gray-400">(YYYY/MM/DD)</span>
          <span class="text-gray-700">: {{ formattedDOB }}</span>
        </p>

        <br />

        <div
          id="MyLanguages"
          class="text-gray-700 text-large font-['Work Sans']"
        >
          <p>
            Languages:
            <span v-if="!(data?.languages && data.languages.length > 0)"
              >None</span
            >
          </p>
          <ul v-if="data?.languages && data.languages.length > 0">
            <li
              v-for="(lang, index) in data.languages"
              :key="index"
              class="ml-5"
            >
              • {{ lang }}
            </li>
          </ul>
        </div>

        <div id="MyNotes" class="text-gray-700 text-large font-['Work Sans']">
          <p>
            Notes:
            <span v-if="!(data?.userNotes && data.userNotes.length > 0)"
              >None</span
            >
          </p>
          <ul v-if="data?.userNotes && data.userNotes.length > 0">
            <li
              v-for="(note, index) in data.userNotes"
              :key="index"
              class="ml-5"
            >
              • {{ note }}
            </li>
          </ul>
        </div>

        <div
          id="MyQualifications"
          class="mb-3 text-gray-700 text-large font-['Work Sans']"
        >
          <p>
            Qualifications:
            <span
              v-if="!(data?.qualifications && data.qualifications.length > 0)"
              >None</span
            >
          </p>
          <ul v-if="data?.qualifications && data.qualifications.length > 0">
            <li
              v-for="(qual, index) in data.qualifications"
              :key="index"
              class="ml-5"
            >
              • {{ qual }}
            </li>
          </ul>
        </div>
      </div>

      <div
        id="AccountInteraction"
        class="flex flex-col items-center bg-white rounded-sm shadow-xl"
      >
        <!-- font-light makes the font malnourished-->
        <button
          class="rounded-lg bg-teal-500 w-1/2 p-1.5 mt-4 mb-4 text-white text-large font-['Work Sans'] hover:bg-teal-600"
        >
          Sign Out
        </button>
        <button
          class="rounded-lg bg-yellow-500 w-1/2 p-1.5 mb-4 text-white text-large font-['Work Sans'] hover:bg-yellow-600"
        >
          Edit Account
        </button>
        <button
          class="rounded-lg bg-red-500 w-1/2 p-1.5 mb-4 text-white text-large font-['Work Sans'] hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>
    </nav>

    <main
      id="MyEvents"
      class="w-3/5 flex flex-col overflow-auto bg-gray-100 border-2 border-gray-100 border-t-gray-200 border-l-[#EEE] lg:w-3/4"
    >
      <!--
        <div id="MyStatus">
          <header>My Status</header>
        </div>
      -->

      <div id="UFEvents" class="flex-1 overflow-y-auto bg-[#EEE]">
        <button
          class="flex items-center w-full sticky top-0 border-2 border-gray-200 border-t-gray-100 bg-[#FFF] rounded-sm p-2"
          @click="togglePresentUpcoming"
        >
          <h1 class="mr-2">Present & Upcoming Events</h1>
          <img v-if="isExpanded1" src="/icon-park_down.jpg" class="w-5 h-5" />
          <img v-else src="/icon-park_up.jpg" class="w-5 h-5" />
        </button>

        <div v-if="isExpanded1">
          <div
            v-for="(event, index) in data.signedUpEvents"
            :key="index"
            class="bg-[#F8F8F8] flex items-center p-2 m-2 rounded-xl lg:w-7/12"
          >
            <h1 class="mr-4">{{ event.name }}</h1>
            <h1 class="mr-4">{{ displayDate(event.dateAndTime) }}</h1>

            <button
              class="bg-teal-400 hover:bg-teal-500 p-2 rounded-xl"
              @click="openPopup(event)"
            >
              View
            </button>
          </div>
        </div>
      </div>

      <div id="PEvents" class="flex-1 overflow-y-auto bg-[#EEE]">
        <button
          class="flex items-center w-full sticky top-0 border-2 border-gray-200 border-t-gray-200 bg-[#FFF] rounded-sm p-2"
          @click="togglePast"
        >
          <h1 class="mr-2">Past Events</h1>
          <img v-if="isExpanded2" src="/icon-park_down.jpg" class="w-5 h-5" />
          <img v-else src="/icon-park_up.jpg" class="w-5 h-5" />
        </button>

        <div v-if="isExpanded2">
          <div
            v-for="(event, index) in data.eventHistory"
            :key="index"
            class="bg-[#F8F8F8] flex items-center p-2 m-2 rounded-xl lg:w-7/12"
          >
            <h1 class="mr-4">{{ event.name }}</h1>
            <h1 class="mr-4">{{ displayDate(event.dateAndTime) }}</h1>

            <button
              class="bg-teal-400 hover:bg-teal-500 p-2 rounded-xl"
              @click="openPopup(event)"
            >
              View
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showPopup"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 bg-opacity-50"
      >
        <div class="rounded-lg p-1 bg-[#EEE]">
          <div class="flex justify-end">
            <button class="bg-[#FF0000]" @click="closePopup">
              <img src="/icon-park_x.jpg" class="w-5 h-5" />
            </button>
          </div>
          <EventListing :event="currentEvent"> </EventListing>
        </div>
      </div>
    </main>
  </div>
</template>