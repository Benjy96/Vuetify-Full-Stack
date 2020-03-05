<template>
    <BaseCard>
        <!-- Goes into BaseCard offset slot -->
          <v-avatar
            slot="offset"
            size="130"
            class="elevation-10"
            color="warning"
          >
            <img v-if="profileImage != ''" :src="profileImage">
            <v-icon v-else x-large>mdi-account-circle</v-icon>
          </v-avatar>
        <!-- Goes into BaseCard default slot -->
          <div id="profileDisplay">
            <h6 class="overline pt-2">{{occupation}}</h6>
            <h1 class="headline pt-1 pb-3">{{firstname}} {{surname}}</h1>
            <p class="font-weight-light">{{description}}</p>
          </div>
    </BaseCard>
</template>

<script>
export default {
    props: {
        profileImage: {
          type: String,
          default: ''
        },
        firstname: {
          type: String,
          default: ''
        },
        surname: {
          type: String,
          default: ''
        },
        description: {
          type: String,
          default: ''
        },
        occupation: {
          type: String,
          default: ''
        }
    }
}
</script>