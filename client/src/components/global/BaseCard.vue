<template>
    <v-card>
        <!-- Head of Card -->
        <div :style="headerStyles">
            <v-card 
            v-if="title"
            :color="color"
            :class="`elevation-${headerElevation}`"
            class="text-left pa-3"
            dark
            >
                <div v-text="title" class="display-1 font-weight-light"/>
                <p v-if="subtitle" v-text="subtitle"
                class="subtitle font-weight-thin"/>
            </v-card>

            <!-- Slot for any content you want offset if not using default title -->
            <slot v-else name="offset"/>
        </div>

        <!-- Body of Card: Default Slot -->
        <v-card-text>
            <slot/>
        </v-card-text>

    </v-card>
</template>

<script>
export default {
    // API
    props: {
        fullWidth: {
            type: Boolean,
            default: false
        },
        offset: {
            type: Number,
            default: 12
        },
        color: {
            type: String,
            default: 'secondary'
        },
        headerElevation: {
            type: [Number, String],
            default: 10
        },
        title: {
            type: String,
            default: undefined
        },
        subtitle: {
            type: String,
            default: undefined
        }
    },
    computed: {
        headerStyles() {
            let styles = {};

            if(this.fullWidth) {
                styles.maxWidth = "100%";
            } else {
                // Vertical | Horizontal
                styles.margin = "0 auto";
                styles.maxWidth = "calc(100% - 32px)";
            }

            /* makes the positioning relative to the container (v-card) 
            so when we offset it, it's moving relative to the card! */
            styles.position = "relative";
            /* top only affects POSITIONED elements - offsets from top */
            styles.top = `-${this.offset * 2}px`;

            /* Brings header closer to content div beneath */
            styles.marginBottom = `-${this.offset * 2}px`;
            styles.marginTop = `${this.offset}px`;

            return styles;
        }
    } 
}
</script>