<template>
    <v-card>
        <!-- Head of Card -->
        <div :style="styles">
            <v-card 
            v-if="title"
            :color="color"
            :class="`elevation-${elevation}`"
            dark
            >
                <h4 v-text="title" class="title font-weight-light"/>
                <p v-text="subtitle"
                class="font-weight-thin"/>
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
        elevation: {
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
        styles() {
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
            styles.marginBottom = `-${this.offset}px`;
            styles.marginTop = `${this.offset * 2}px`;

            return styles;
        }
    } 
}
</script>