<template>
    <v-container>
        <v-row>
            <v-col>
                <DashboardCard></DashboardCard>
            </v-col>
        </v-row>
    </v-container>
    
</template>

<script>
import DashboardCard from '../DashboardCard';

export default {
    components: { 
        DashboardCard
    }
}
</script>