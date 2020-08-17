export default {
    data() {
        return {
            showUpdateButton: false,
            lastRetrievedAt: null
        }
    },

    computed: {
        displayValue() {
            return this.field.displayUsingLabels
                ? _.find(this.field.options, { value: this.field.value }).label
                : this.field.value;
        }
    },

    mounted() {

        this.updateLastRetrievedAtTimestamp();
    },

    methods: {
        async submit() {
            let formData = new FormData();

            formData.append(this.field.attribute, this.value);
            formData.append('_method', 'PUT');

            return Nova.request().post(`/nova-api/${this.resourceName}/${this.resourceId}`, formData)
                .then(() => {
                    let label = _.find(this.field.options, option => option.value == this.value).label;

                    this.$toasted.show(`${this.field.name} updated to "${label}"`, { type: 'success' });
                }, (response) => {
                    this.$toasted.show(response, { type: 'error' });
                })
                .finally(() => {
                    this.showUpdateButton = false;
                });
        },

        async submitRelated() {

            let formData = new FormData();
            let attribute = this.field.attribute.split(".");
            formData.append(attribute[1], this.value);

            let relatedResource = this.field.relationship;
            let relatedResourceId = this.field.relatedId;

            formData.append('viaRelationship', relatedResource);
            formData.append(relatedResource, relatedResourceId);

            formData.append(relatedResource + '_trashed', this.withTrashed);
            formData.append('_retrieved_at', this.lastRetrievedAt);

            return Nova.request().post(`/nova-api/${this.resourceName}/${this.resourceId}/update-attached/${relatedResource}/${relatedResourceId}`, formData, {
                params: {
                    editing: true,
                    editMode: 'update-attached',
                }
            })
                .then(() => {
                    let label = _.find(this.field.options, option => option.value == this.value).label;

                    this.$toasted.show(`${this.field.name} updated to "${label}"`, { type: 'success' });
                }, (response) => {
                    this.$toasted.show(response, { type: 'error' });
                })
                .finally(() => {
                    this.showUpdateButton = false;
                });
        },

        updateLastRetrievedAtTimestamp() {
            this.lastRetrievedAt = Math.floor(new Date().getTime() / 1000)
        },
    }
}
