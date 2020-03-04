<template>
    <v-card>
        <!-- Head of Card -->
        <div :id="widthId" :style="styles">
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

            <!-- Slot for any content you want offset if not using title -->
            <slot v-else name="offset"/>
        </div>

        <!-- Body of Card -->
        <v-card-text>
            <slot name="body"/>
        </v-card-text>

    </v-card>
</template>

<script>
export default {

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
        },
        text: {
            type: String,
            default: undefined
        }
    },
    computed: {
        widthId() {
            if(this.fullWidth) {
                return "BaseCardHead--full-width";
            } else {
                return "BaseCardHead";
            }
        },
        styles() {
            //TODO: Combine with the offset stuff - how does Vue interpret the styles object returned?
            return {
                /* makes the positioning relative to the container (v-card) 
                so when we offset it, it's moving relative to the card! */
                position: "relative",
            
                /* top only affects POSITIONED elements - offsets from top */
                top: "-24px",

                /* Brings header closer to content div beneath */
                marginBottom: `-${this.offset}px`,

                marginTop: `24px`
            }
        }
    }
    
}
</script>

<style scoped>
#BaseCardHead {
    /* Centers the header - vertical | horizontal */
    margin: 0 auto;
    max-width: calc(100% - 32px);
}

#BaseCardHead--full-width {
    max-width: 100%;
}
</style>