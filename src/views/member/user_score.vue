<template>
  <div>
    CREATE TABLE Persons ( PersonID int, LastName varchar(255), FirstName varchar(255), Address
    varchar(255), City varchar(255) );
    <button
      class="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
    >
      Click me
    </button>
  </div>
</template>

<script lang="ts">
export default {
  setup() {
    return {};
  },
};
</script>

<style scoped></style>
