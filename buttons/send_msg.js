const client = require("../.")
const config = client.config;
const { getTable, createEmbed} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder, ModalBuilder ,TextInputStyle,TextInputBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'send_msg',
	permissions: [],
	run: async (client, interaction) => {
        const modal = new ModalBuilder()
			.setCustomId('send_msg_Modal')
			.setTitle('ارسال رسالة لصاحب التذكرة');
        

            const name = new TextInputBuilder()
			.setCustomId('text')
			.setLabel("الرسالة؟")
            .setPlaceholder('قم بتركه فارغ لأرسال رسالة تذكير')

			.setStyle(TextInputStyle.Short)
            .setRequired(false);



            const nameq = new ActionRowBuilder().addComponents(name);
            modal.addComponents(nameq);

            await interaction.showModal(modal);

	}
};
