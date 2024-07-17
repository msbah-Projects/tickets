const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Req_Add_members} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'req_rename',
	permissions: [],
	run: async (client, interaction) => {

        const modal = new ModalBuilder()
			.setCustomId('Req_rename_Modal')
			.setTitle('تغير اسم التذكرة');
        

            const name = new TextInputBuilder()
			.setCustomId('name')
			.setLabel("اسم التذكرة الجديد؟")
            .setPlaceholder('لكتابه رقم التذكرة اكتب {id}')

			.setStyle(TextInputStyle.Short)
            .setRequired(true);



            const nameq = new ActionRowBuilder().addComponents(name);
            modal.addComponents(nameq);

            await interaction.showModal(modal);
    }
};
